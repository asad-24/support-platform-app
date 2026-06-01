import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../sites/data/sites_repository.dart';
import '../data/volunteer_notification.dart';
import 'volunteer_home_screen.dart';

class VolunteerNotificationsScreen extends ConsumerStatefulWidget {
  const VolunteerNotificationsScreen({super.key});

  @override
  ConsumerState<VolunteerNotificationsScreen> createState() =>
      _VolunteerNotificationsScreenState();
}

class _VolunteerNotificationsScreenState
    extends ConsumerState<VolunteerNotificationsScreen>
    with WidgetsBindingObserver {
  bool _markingAllRead = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => _refreshNotifications(),
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _refreshNotifications();
  }

  Future<void> _refreshNotifications() async {
    final session = ref.read(authControllerProvider).valueOrNull?.session;
    if (session == null) return;
    final userId = session.user.id;
    final sites = submittedSitesProvider(userId);
    final notifications = volunteerNotificationsProvider(userId);

    if (!ref.read(sites).isLoading) ref.invalidate(sites);
    if (!ref.read(notifications).isLoading) ref.invalidate(notifications);
    ref.invalidate(volunteerUnreadNotificationsProvider(userId));

    await Future.wait([ref.read(sites.future), ref.read(notifications.future)]);
  }

  void _markUnreadNotificationsRead(
    String userId,
    List<VolunteerNotification> notifications,
  ) {
    if (_markingAllRead) return;
    if (!notifications.any((notification) => !notification.isRead)) return;
    _markingAllRead = true;
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await Future<void>.delayed(const Duration(milliseconds: 700));
      if (!mounted) return;
      try {
        await ref.read(volunteerNotificationsRepositoryProvider).markAllRead();
        if (!mounted) return;
        ref.invalidate(volunteerNotificationsProvider(userId));
        ref.invalidate(volunteerUnreadNotificationsProvider(userId));
      } finally {
        _markingAllRead = false;
      }
    });
  }

  Future<void> _openNotification(
    BuildContext context,
    String userId,
    VolunteerNotification notification,
  ) async {
    if (!notification.isRead) {
      await ref
          .read(volunteerNotificationsRepositoryProvider)
          .markRead(notification.id);
      ref.invalidate(volunteerNotificationsProvider(userId));
      ref.invalidate(volunteerUnreadNotificationsProvider(userId));
    }
    if (!context.mounted || notification.siteId.isEmpty) return;
    context.go('/volunteer/submitted-schools/${notification.siteId}');
  }

  @override
  Widget build(BuildContext context) {
    final userId =
        ref.watch(authControllerProvider).valueOrNull?.session?.user.id ??
        'field-001';
    final notifications = ref.watch(volunteerNotificationsProvider(userId));

    return VolunteerMainBackScope(
      currentPath: '/volunteer/notifications',
      child: Scaffold(
        backgroundColor: AppColors.screen(context),
        body: SafeArea(
          bottom: false,
          child: Center(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: Responsive.pageMaxWidth(context),
              ),
              child: notifications.when(
                data: (items) {
                  _markUnreadNotificationsRead(userId, items);
                  return _NotificationsBody(
                    notifications: items,
                    onRefresh: _refreshNotifications,
                    onOpenNotification: (notification) =>
                        _openNotification(context, userId, notification),
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, _) => Center(child: Text(error.toString())),
              ),
            ),
          ),
        ),
        bottomNavigationBar: const VolunteerBottomNavigation(currentIndex: 2),
      ),
    );
  }
}

class _NotificationsBody extends StatelessWidget {
  const _NotificationsBody({
    required this.notifications,
    required this.onRefresh,
    required this.onOpenNotification,
  });

  final List<VolunteerNotification> notifications;
  final RefreshCallback onRefresh;
  final ValueChanged<VolunteerNotification> onOpenNotification;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(18, 28, 18, 18),
        children: [
          Text(
            'Notifications',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontSize: 22,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Admin review updates for approved records and corrections.',
            style: TextStyle(
              color: AppColors.secondaryText(context),
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 18),
          if (notifications.isEmpty)
            const _NotificationsEmptyState()
          else
            for (final notification in notifications) ...[
              _NotificationCard(
                notification: notification,
                onTap: () => onOpenNotification(notification),
              ),
              const SizedBox(height: 12),
            ],
        ],
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({required this.notification, required this.onTap});

  final VolunteerNotification notification;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isApproved = notification.type == VolunteerNotificationType.approved;
    final color = isApproved ? AppColors.onboardingGreen : AppColors.danger;
    final background = isApproved
        ? AppColors.greenTint(context)
        : AppColors.dangerTint(context);
    final icon = isApproved
        ? Icons.check_circle_outline_rounded
        : Icons.error_outline_rounded;
    final isUnread = !notification.isRead;
    final title = notification.title;

    return Material(
      color: isUnread
          ? background.withValues(alpha: 0.28)
          : AppColors.elevatedSurface(context),
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: isUnread
                  ? color.withValues(alpha: 0.55)
                  : AppColors.border(context),
              width: isUnread ? 1.4 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(
                  alpha: AppColors.isDark(context) ? 0.18 : 0.025,
                ),
                offset: const Offset(0, 4),
                blurRadius: 12,
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: background,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        color: AppColors.primaryText(context),
                        fontSize: 15,
                        fontWeight: isUnread
                            ? FontWeight.w900
                            : FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 7),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: isUnread
                              ? color.withValues(alpha: 0.12)
                              : AppColors.border(
                                  context,
                                ).withValues(alpha: 0.45),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          isUnread ? 'Unread' : 'Read',
                          style: TextStyle(
                            color: isUnread
                                ? color
                                : AppColors.secondaryText(context),
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      notification.siteName,
                      style: TextStyle(
                        color: AppColors.secondaryText(context),
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      notification.message,
                      style: TextStyle(
                        color: AppColors.primaryText(context),
                        fontSize: 13,
                        height: 1.25,
                        fontWeight: isUnread
                            ? FontWeight.w800
                            : FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      DateFormat.yMMMd().add_jm().format(
                        notification.createdAt,
                      ),
                      style: TextStyle(
                        color: AppColors.secondaryText(context),
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: AppColors.secondaryText(context),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NotificationsEmptyState extends StatelessWidget {
  const _NotificationsEmptyState();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: AppColors.elevatedSurface(context),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Column(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: AppColors.greenTint(context),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.notifications_none_rounded,
              color: AppColors.onboardingGreen,
              size: 28,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'No notifications yet',
            style: TextStyle(
              color: AppColors.primaryText(context),
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Approved records and correction requests from admin will appear here.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.secondaryText(context),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
