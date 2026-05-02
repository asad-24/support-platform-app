import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../data/volunteer_reward.dart';

class VolunteerRewardBadge extends StatelessWidget {
  const VolunteerRewardBadge({
    super.key,
    required this.approvedCount,
    this.onDarkBackground = false,
  });

  final int approvedCount;
  final bool onDarkBackground;

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
