import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/models/app_enums.dart';
import 'shared_widgets.dart';

class NeedsPrioritiesStep extends StatelessWidget {
  const NeedsPrioritiesStep({
    super.key,
    required this.needs,
    required this.urgency,
    required this.onNeedToggled,
    required this.onUrgencyChanged,
  });

  final Set<NeedType> needs;
  final UrgencyLevel urgency;
  final void Function(NeedType need, bool selected) onNeedToggled;
  final ValueChanged<UrgencyLevel> onUrgencyChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AddSiteFormSectionHeader(
          title: 'Identified Needs',
          description: 'Select all intervention areas needed for this school.',
        ),
        _NeedsGrid(selectedNeeds: needs, onNeedToggled: onNeedToggled),
        const SizedBox(height: 18),
        const AddSiteFormSectionHeader(
          title: 'Urgency Level',
          description: 'Overall priority for intervention and follow up.',
        ),
        _UrgencySelector(selectedUrgency: urgency, onChanged: onUrgencyChanged),
      ],
    );
  }
}

class _NeedsGrid extends StatelessWidget {
  const _NeedsGrid({required this.selectedNeeds, required this.onNeedToggled});

  final Set<NeedType> selectedNeeds;
  final void Function(NeedType need, bool selected) onNeedToggled;

  static const _needs = [
    NeedType.feeding,
    NeedType.clothing,
    NeedType.shelterImprovement,
    NeedType.healthOutreach,
    NeedType.counselling,
    NeedType.sanitation,
    NeedType.waterAccess,
    NeedType.hygieneKits,
    NeedType.educationMaterials,
    NeedType.safeguarding,
    NeedType.bedding,
    NeedType.identityDocumentation,
    NeedType.other,
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columnCount = constraints.maxWidth >= 760
            ? 3
            : constraints.maxWidth >= 480
            ? 2
            : 1;
        final spacing = 10.0;
        final width =
            (constraints.maxWidth - spacing * (columnCount - 1)) / columnCount;

        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final need in _needs)
              SizedBox(
                width: width,
                child: _NeedButton(
                  need: need,
                  selected: selectedNeeds.contains(need),
                  onTap: () =>
                      onNeedToggled(need, !selectedNeeds.contains(need)),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _NeedButton extends StatelessWidget {
  const _NeedButton({
    required this.need,
    required this.selected,
    required this.onTap,
  });

  final NeedType need;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        constraints: const BoxConstraints(minHeight: 52),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.paleGreen : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? AppColors.onboardingGreen : AppColors.line,
            width: selected ? 1.6 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: AppColors.onboardingGreen.withValues(alpha: 0.10),
                    blurRadius: 14,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: Row(
          children: [
            Icon(
              _needIcon(need),
              color: selected ? AppColors.deepGreen : AppColors.muted,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                need.label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: selected ? AppColors.deepGreen : AppColors.ink,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                ),
              ),
            ),
            if (selected) ...[
              const SizedBox(width: 8),
              const Icon(
                Icons.check_circle_rounded,
                color: AppColors.onboardingGreen,
                size: 18,
              ),
            ],
          ],
        ),
      ),
    );
  }

  IconData _needIcon(NeedType need) {
    return switch (need) {
      NeedType.feeding => Icons.restaurant_rounded,
      NeedType.clothing => Icons.checkroom_rounded,
      NeedType.bedding => Icons.bed_rounded,
      NeedType.shelterImprovement => Icons.home_repair_service_rounded,
      NeedType.healthOutreach => Icons.local_hospital_rounded,
      NeedType.counselling => Icons.psychology_alt_rounded,
      NeedType.sanitation => Icons.clean_hands_rounded,
      NeedType.waterAccess => Icons.water_drop_rounded,
      NeedType.hygieneKits => Icons.soap_rounded,
      NeedType.educationMaterials => Icons.menu_book_rounded,
      NeedType.safeguarding => Icons.health_and_safety_rounded,
      NeedType.identityDocumentation => Icons.badge_rounded,
      NeedType.other => Icons.more_horiz_rounded,
    };
  }
}

class _UrgencySelector extends StatelessWidget {
  const _UrgencySelector({
    required this.selectedUrgency,
    required this.onChanged,
  });

  final UrgencyLevel selectedUrgency;
  final ValueChanged<UrgencyLevel> onChanged;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxWidth < 560;
        final children = UrgencyLevel.values.map((level) {
          return _UrgencyButton(
            urgency: level,
            selected: selectedUrgency == level,
            onTap: () => onChanged(level),
          );
        }).toList();

        if (compact) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < children.length; i++) ...[
                children[i],
                if (i < children.length - 1) const SizedBox(height: 10),
              ],
            ],
          );
        }

        return Row(
          children: [
            for (var i = 0; i < children.length; i++) ...[
              Expanded(child: children[i]),
              if (i < children.length - 1) const SizedBox(width: 10),
            ],
          ],
        );
      },
    );
  }
}

class _UrgencyButton extends StatelessWidget {
  const _UrgencyButton({
    required this.urgency,
    required this.selected,
    required this.onTap,
  });

  final UrgencyLevel urgency;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        constraints: const BoxConstraints(minHeight: 58),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFFFF7D6) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? AppColors.amber : AppColors.line,
            width: selected ? 1.6 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              _urgencyIcon(urgency),
              color: selected ? AppColors.orange : AppColors.muted,
              size: 22,
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                urgency.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: selected ? AppColors.ink : AppColors.muted,
                  fontSize: 14,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _urgencyIcon(UrgencyLevel urgency) {
    return switch (urgency) {
      UrgencyLevel.low => Icons.flag_outlined,
      UrgencyLevel.medium => Icons.priority_high_rounded,
      UrgencyLevel.high => Icons.warning_amber_rounded,
    };
  }
}
