import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../features/auth/presentation/auth_controller.dart';
import '../../../features/sites/data/sites_repository.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/user_access_role.dart';
import '../../../shared/widgets/metric_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key, this.dashboardRole});

  final UserAccessRole? dashboardRole;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authControllerProvider).valueOrNull?.session;
    final summary = ref.watch(dashboardSummaryProvider);
    final isAdmin = session?.user.role == UserRole.admin;
    final accessRole =
        dashboardRole ?? session?.accessRole ?? UserAccessRole.volunteer;
    final isHelper = accessRole == UserAccessRole.helper;

    return Scaffold(
      appBar: AppBar(
        title: Text('${accessRole.label} Dashboard'),
        actions: [
          IconButton(
            tooltip: 'Logout',
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            icon: const Icon(Icons.logout_rounded),
          ),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: Responsive.pageMaxWidth(context),
            ),
            child: ListView(
              padding: Responsive.pagePadding(context),
              children: [
                Text(
                  'Welcome, ${session?.user.name ?? 'Atlas user'}',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 6),
                Text(
                  isAdmin
                      ? 'Admin review, verification, and export workspace'
                      : isHelper
                      ? 'Browse mapped schools and offer support where needed'
                      : 'Field collection and welfare assessment workspace',
                  style: const TextStyle(color: AppColors.muted),
                ),
                const SizedBox(height: 18),
                summary.when(
                  data: (data) => GridView(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: MediaQuery.sizeOf(context).width > 700
                          ? 5
                          : 2,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: MediaQuery.sizeOf(context).width > 700
                          ? 1.1
                          : 1.2,
                    ),
                    children: [
                      MetricCard(
                        label: 'Total sites',
                        value: '${data.totalSites}',
                        icon: Icons.school_rounded,
                      ),
                      MetricCard(
                        label: 'Estimated children',
                        value: '${data.estimatedChildren}',
                        icon: Icons.groups_2_rounded,
                      ),
                      MetricCard(
                        label: 'Pending verification',
                        value: '${data.pendingVerification}',
                        icon: Icons.fact_check_outlined,
                        color: AppColors.amber,
                      ),
                      MetricCard(
                        label: 'Verified sites',
                        value: '${data.verifiedSites}',
                        icon: Icons.verified_rounded,
                      ),
                      MetricCard(
                        label: 'High urgency',
                        value: '${data.highUrgencySites}',
                        icon: Icons.priority_high_rounded,
                        color: AppColors.danger,
                      ),
                    ],
                  ),
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (error, _) => Text(error.toString()),
                ),
                const SizedBox(height: 18),
                _ActionGrid(isAdmin: isAdmin, accessRole: accessRole),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ActionGrid extends StatelessWidget {
  const _ActionGrid({required this.isAdmin, required this.accessRole});

  final bool isAdmin;
  final UserAccessRole accessRole;

  @override
  Widget build(BuildContext context) {
    final actions = [
      _HomeAction('Map', Icons.map_rounded, '/map'),
      _HomeAction('Sites', Icons.list_alt_rounded, '/sites'),
      if (!isAdmin && accessRole == UserAccessRole.volunteer)
        _HomeAction('Add site', Icons.add_location_alt_rounded, '/sites/new'),
      if (accessRole == UserAccessRole.helper)
        _HomeAction('Offer support', Icons.favorite_border_rounded, '/sites'),
      if (accessRole == UserAccessRole.volunteer)
        _HomeAction('Drafts', Icons.inventory_2_outlined, '/drafts'),
      if (accessRole == UserAccessRole.volunteer)
        _HomeAction('Sync', Icons.sync_rounded, '/sync'),
      if (isAdmin) _HomeAction('Export', Icons.download_rounded, '/export'),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: actions.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: MediaQuery.sizeOf(context).width > 700 ? 3 : 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.35,
      ),
      itemBuilder: (context, index) {
        final action = actions[index];
        return Card(
          child: InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: () => context.go(action.path),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(action.icon, color: AppColors.deepGreen, size: 30),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          action.label,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_rounded,
                        color: AppColors.muted,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _HomeAction {
  const _HomeAction(this.label, this.icon, this.path);

  final String label;
  final IconData icon;
  final String path;
}
