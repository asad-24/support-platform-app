import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';
import '../models/app_enums.dart';

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.label, required this.color});

  factory StatusBadge.verification(VerificationStatus status) {
    return StatusBadge(
      label: status.label,
      color: switch (status) {
        VerificationStatus.pending => AppColors.amber,
        VerificationStatus.verified => AppColors.forestGreen,
        VerificationStatus.rejected => AppColors.danger,
      },
    );
  }

  factory StatusBadge.urgency(UrgencyLevel level) {
    return StatusBadge(
      label: '${level.label} urgency',
      color: switch (level) {
        UrgencyLevel.high => AppColors.danger,
        UrgencyLevel.medium => AppColors.orange,
        UrgencyLevel.low => AppColors.forestGreen,
      },
    );
  }

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w800,
          fontSize: 12,
        ),
      ),
    );
  }
}
