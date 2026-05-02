import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/storage/storage_providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/widgets/empty_state.dart';
import '../data/sites_repository.dart';

class SyncScreen extends ConsumerStatefulWidget {
  const SyncScreen({super.key});

  @override
  ConsumerState<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends ConsumerState<SyncScreen> {
  bool _syncing = false;

  @override
  Widget build(BuildContext context) {
    final drafts = ref.watch(draftsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Pending sync')),
      body: drafts.when(
        data: (items) {
          final pending = items.where((draft) => draft.syncPending).toList();
          if (pending.isEmpty) {
            return const EmptyState(
              icon: Icons.cloud_done_rounded,
              title: 'Nothing waiting to sync',
              message: 'Records submitted with Sync Later will appear here.',
            );
          }
          return Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: Responsive.pageMaxWidth(context),
              ),
              child: ListView(
                padding: Responsive.pagePadding(context),
                children: [
                  ElevatedButton.icon(
                    onPressed: _syncing ? null : _syncPending,
                    icon: _syncing
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.sync_rounded),
                    label: Text(
                      _syncing
                          ? 'Syncing...'
                          : 'Sync ${pending.length} pending record(s)',
                    ),
                  ),
                  const SizedBox(height: 14),
                  ...pending.map(
                    (draft) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Card(
                        child: ListTile(
                          leading: const Icon(
                            Icons.cloud_upload_outlined,
                            color: AppColors.deepGreen,
                          ),
                          title: Text(draft.displayName),
                          subtitle: Text(
                            '${draft.payload['community'] ?? 'Unknown community'} • ${draft.urgency.label} urgency',
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
      ),
    );
  }

  Future<void> _syncPending() async {
    setState(() => _syncing = true);
    try {
      final draftStorage = ref.read(localDraftStorageProvider);
      final repository = ref.read(sitesRepositoryProvider);
      final pending = (await draftStorage.all()).where(
        (draft) => draft.syncPending,
      );
      for (final draft in pending) {
        await repository.createSite(draft.payload);
        await draftStorage.delete(draft.id);
      }
      ref
        ..invalidate(draftsProvider)
        ..invalidate(sitesProvider)
        ..invalidate(dashboardSummaryProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Pending records synced.')));
    } finally {
      if (mounted) setState(() => _syncing = false);
    }
  }
}
