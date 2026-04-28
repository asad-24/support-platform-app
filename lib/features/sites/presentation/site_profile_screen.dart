import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../features/auth/presentation/auth_controller.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/widgets/status_badge.dart';
import '../data/sites_repository.dart';

class SiteProfileScreen extends ConsumerWidget {
  const SiteProfileScreen({super.key, required this.siteId});

  final String siteId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sites = ref.watch(sitesProvider);
    final session = ref.watch(authControllerProvider).valueOrNull?.session;
    final canSeeSafeguarding = session?.user.role == UserRole.admin;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Site profile'),
        actions: [
          IconButton(
            tooltip: 'Edit',
            onPressed: () => context.go('/sites/$siteId/edit'),
            icon: const Icon(Icons.edit_rounded),
          ),
        ],
      ),
      body: sites.when(
        data: (items) {
          final site = items.firstWhere((item) => item.id == siteId);
          final population = site.populationSummary;
          final welfare = site.welfareAssessment;
          return Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: Responsive.pageMaxWidth(context),
              ),
              child: ListView(
                padding: Responsive.pagePadding(context),
                children: [
                  Text(
                    site.name,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${site.uniqueSiteId} • ${site.community}, ${site.lga}, ${site.state}',
                    style: const TextStyle(color: AppColors.muted),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      StatusBadge.verification(site.verificationStatus),
                      StatusBadge.urgency(site.urgencyLevel),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 210,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: GoogleMap(
                        initialCameraPosition: CameraPosition(
                          target: LatLng(site.latitude, site.longitude),
                          zoom: 13,
                        ),
                        markers: {
                          Marker(
                            markerId: MarkerId(site.id),
                            position: LatLng(site.latitude, site.longitude),
                            infoWindow: InfoWindow(title: site.name),
                          ),
                        },
                        zoomControlsEnabled: false,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _Section(
                    title: 'Basic details',
                    children: [
                      _Info('Type', site.type),
                      _Info('Operator', site.operatorName),
                      _Info('Phone', site.phone),
                      _Info('Ward', site.ward),
                      _Info('Landmark', site.landmark ?? 'Not provided'),
                    ],
                  ),
                  _Section(
                    title: 'Population summary',
                    children: [
                      _Info(
                        'Total children',
                        '${population?.totalChildren ?? 0}',
                      ),
                      _Info('Resident', '${population?.residentChildren ?? 0}'),
                      _Info(
                        'Non-resident',
                        '${population?.nonResidentChildren ?? 0}',
                      ),
                      _Info(
                        'Ages 6-14',
                        '${(population?.age6to9 ?? 0) + (population?.age10to14 ?? 0)}',
                      ),
                    ],
                  ),
                  _Section(
                    title: 'Welfare and conditions',
                    children: [
                      _Info('Feeding', welfare?.feedingStatus ?? 'Unknown'),
                      _Info('Shelter', welfare?.shelterStatus ?? 'Unknown'),
                      _Info(
                        'Sanitation',
                        welfare?.sanitationStatus ?? 'Unknown',
                      ),
                      _Info('Water', welfare?.waterAccess ?? 'Unknown'),
                      _Info(
                        'Health access',
                        welfare?.healthAccess ?? 'Unknown',
                      ),
                      if (canSeeSafeguarding)
                        _Info(
                          'Safety risks',
                          welfare?.safetyRisks ?? 'No admin note',
                        ),
                    ],
                  ),
                  _Section(
                    title: 'Needs',
                    children: [
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: site.needs
                            .map((need) => Chip(label: Text(need.label)))
                            .toList(),
                      ),
                    ],
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
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 10),
              ...children,
            ],
          ),
        ),
      ),
    );
  }
}

class _Info extends StatelessWidget {
  const _Info(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.muted,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
