import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../data/volunteer_reward.dart';

class VolunteerRewardBadge extends StatelessWidget {
  const VolunteerRewardBadge({
    super.key,
    required this.approvedCount,
    this.onDarkBackground = false,
    this.showInfoButton = false,
  });

  final int approvedCount;
  final bool onDarkBackground;
  final bool showInfoButton;

  @override
  Widget build(BuildContext context) {
    final level = VolunteerRewardLevel.fromApprovedCount(approvedCount);
    final foreground = onDarkBackground
        ? Colors.white
        : AppColors.primaryText(context);
    final muted = onDarkBackground
        ? AppColors.mutedOnGreen
        : AppColors.secondaryText(context);
    final fill = onDarkBackground
        ? Colors.white.withValues(alpha: 0.12)
        : AppColors.softFill(context);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.workspace_premium_rounded,
                color: onDarkBackground ? Colors.white : AppColors.amber,
                size: 18,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  level.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: foreground,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              _Stars(count: level.starCount),
              if (showInfoButton) ...[
                const SizedBox(width: 2),
                IconButton(
                  tooltip: 'How levels work',
                  visualDensity: VisualDensity.compact,
                  constraints: const BoxConstraints.tightFor(
                    width: 34,
                    height: 34,
                  ),
                  onPressed: () => _showRewardInfo(context),
                  icon: Icon(
                    Icons.info_outline_rounded,
                    color: onDarkBackground
                        ? Colors.white
                        : AppColors.secondaryText(context),
                    size: 19,
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 6),
          Text(
            level.description,
            style: TextStyle(
              color: muted,
              fontSize: 12,
              height: 1.2,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 7,
              value: level.progressFor(approvedCount),
              backgroundColor: onDarkBackground
                  ? Colors.white.withValues(alpha: 0.16)
                  : AppColors.border(context),
              valueColor: AlwaysStoppedAnimation<Color>(
                onDarkBackground ? Colors.white : AppColors.onboardingGreen,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            level.nextTarget == null
                ? '$approvedCount approved schools'
                : '${level.remainingForNext(approvedCount)} more approved schools to next level',
            style: TextStyle(
              color: muted,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  void _showRewardInfo(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (context) => const _RewardInfoDialog(),
    );
  }
}

class _Stars extends StatelessWidget {
  const _Stars({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var index = 0; index < 5; index++)
          Icon(
            index < count ? Icons.star_rounded : Icons.star_border_rounded,
            color: AppColors.amber,
            size: 16,
          ),
      ],
    );
  }
}

class _RewardInfoDialog extends StatelessWidget {
  const _RewardInfoDialog();

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 28),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 460, maxHeight: 560),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 14, 8, 6),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Volunteer levels',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: 'Close',
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
            ),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 6, 18, 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Levels are based on how many school records are approved by an admin. Pending and correction records do not increase the level until they are approved.',
                      style: TextStyle(
                        color: AppColors.secondaryText(context),
                        height: 1.35,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const _RewardLevelRow(
                      stars: 0,
                      title: 'Community Starter',
                      range: '0-4 approved schools',
                    ),
                    const _RewardLevelRow(
                      stars: 1,
                      title: 'Field Contributor',
                      range: '5-14 approved schools',
                    ),
                    const _RewardLevelRow(
                      stars: 2,
                      title: 'Trusted Mapper',
                      range: '15-29 approved schools',
                    ),
                    const _RewardLevelRow(
                      stars: 3,
                      title: 'Impact Builder',
                      range: '30-49 approved schools',
                    ),
                    const _RewardLevelRow(
                      stars: 4,
                      title: 'Senior Field Lead',
                      range: '50-99 approved schools',
                    ),
                    const _RewardLevelRow(
                      stars: 5,
                      title: 'Atlas Champion',
                      range: '100+ approved schools',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RewardLevelRow extends StatelessWidget {
  const _RewardLevelRow({
    required this.stars,
    required this.title,
    required this.range,
  });

  final int stars;
  final String title;
  final String range;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.softFill(context),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border(context)),
      ),
      child: Row(
        children: [
          _Stars(count: stars),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: AppColors.primaryText(context),
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  range,
                  style: TextStyle(
                    color: AppColors.secondaryText(context),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
