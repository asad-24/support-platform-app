import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../features/auth/presentation/auth_controller.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/site_card.dart';
import '../data/sites_repository.dart';

class SiteListScreen extends ConsumerStatefulWidget {
  const SiteListScreen({super.key});

  @override
  ConsumerState<SiteListScreen> createState() => _SiteListScreenState();
}

class _SiteListScreenState extends ConsumerState<SiteListScreen> {
  String _query = '';
  VerificationStatus? _status;
  UrgencyLevel? _urgency;
  NeedType? _need;

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(authControllerProvider).valueOrNull?.session;
    final sites = session?.user.role == UserRole.fieldWorker
        ? ref.watch(submittedSitesProvider(session!.user.id))
        : ref.watch(sitesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sites'),
        actions: [
          IconButton(
            tooltip: 'Add site',
            onPressed: () => context.go('/sites/new'),
            icon: const Icon(Icons.add_location_alt_rounded),
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: Responsive.pageMaxWidth(context),
          ),
          child: Column(
            children: [
              Padding(
                padding: Responsive.pagePadding(context).copyWith(bottom: 8),
                child: Column(
                  children: [
                    TextField(
                      decoration: const InputDecoration(
                        hintText: 'Search by name, unique ID, or community',
                        prefixIcon: Icon(Icons.search_rounded),
                      ),
                      onChanged: (value) => setState(() => _query = value),
                    ),
                    const SizedBox(height: 10),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _FilterChip(
                            label: _status?.label ?? 'Verification',
                            selected: _status != null,
                            onTap: () => _pickVerification(context),
                          ),
                          _FilterChip(
                            label: _urgency == null
                                ? 'Urgency'
                                : '${_urgency!.label} urgency',
                            selected: _urgency != null,
                            onTap: () => _pickUrgency(context),
                          ),
                          _FilterChip(
                            label: _need?.label ?? 'Needs',
                            selected: _need != null,
                            onTap: () => _pickNeed(context),
                          ),
                          if (_status != null ||
                              _urgency != null ||
                              _need != null ||
                              _query.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(left: 8),
                              child: TextButton.icon(
                                onPressed: () => setState(() {
                                  _query = '';
                                  _status = null;
                                  _urgency = null;
                                  _need = null;
                                }),
                                icon: const Icon(Icons.clear_rounded),
                                label: const Text('Clear'),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: sites.when(
                  data: (allSites) {
                    final filtered = allSites.where((site) {
                      final matchesQuery =
                          _query.trim().isEmpty ||
                          site.name.toLowerCase().contains(
                            _query.toLowerCase(),
                          ) ||
                          site.uniqueSiteId.toLowerCase().contains(
                            _query.toLowerCase(),
                          ) ||
                          site.community.toLowerCase().contains(
                            _query.toLowerCase(),
                          );
                      final matchesStatus =
                          _status == null || site.verificationStatus == _status;
                      final matchesUrgency =
                          _urgency == null || site.urgencyLevel == _urgency;
                      final matchesNeed =
                          _need == null || site.needs.contains(_need);
                      return matchesQuery &&
                          matchesStatus &&
                          matchesUrgency &&
                          matchesNeed;
                    }).toList();

                    if (filtered.isEmpty) {
                      return const EmptyState(
                        icon: Icons.search_off_rounded,
                        title: 'No sites found',
                        message: 'Adjust filters or add a new field record.',
                      );
                    }

                    return ListView.separated(
                      padding: Responsive.pagePadding(context),
                      itemCount: filtered.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 10),
                      itemBuilder: (context, index) {
                        final site = filtered[index];
                        return SiteCard(
                          site: site,
                          onTap: () => context.go('/sites/${site.id}'),
                        );
                      },
                    );
                  },
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (error, _) => Center(child: Text(error.toString())),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickVerification(BuildContext context) async {
    final result = await _showChoice<VerificationStatus>(
      context,
      VerificationStatus.values,
      (item) => item.label,
    );
    if (result != null) setState(() => _status = result);
  }

  Future<void> _pickUrgency(BuildContext context) async {
    final result = await _showChoice<UrgencyLevel>(
      context,
      UrgencyLevel.values,
      (item) => item.label,
    );
    if (result != null) setState(() => _urgency = result);
  }

  Future<void> _pickNeed(BuildContext context) async {
    final result = await _showChoice<NeedType>(
      context,
      NeedType.values,
      (item) => item.label,
    );
    if (result != null) setState(() => _need = result);
  }

  Future<T?> _showChoice<T>(
    BuildContext context,
    List<T> items,
    String Function(T) label,
  ) {
    return showModalBottomSheet<T>(
      context: context,
      showDragHandle: true,
      builder: (context) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            ...items.map((item) {
              return ListTile(
                title: Text(label(item)),
                onTap: () => Navigator.of(context).pop(item),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        avatar: Icon(
          selected ? Icons.check_rounded : Icons.tune_rounded,
          size: 18,
          color: AppColors.deepGreen,
        ),
        label: Text(label),
        onPressed: onTap,
      ),
    );
  }
}
