import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../shared/models/app_enums.dart';
import 'models.dart';
import 'shared_widgets.dart';

class ReviewStep extends StatelessWidget {
  const ReviewStep({
    super.key,
    required this.data,
    required this.photos,
    required this.submitting,
    required this.onEditStep,
    required this.onSyncLater,
  });

  final AddSiteReviewData data;
  final List<SitePhotoDraft> photos;
  final bool submitting;
  final ValueChanged<int> onEditStep;
  final VoidCallback onSyncLater;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AddSiteFormSectionHeader(
          title: 'Review',
          description: 'Check the full school record before final submission.',
        ),
        _ReviewSection(
          title: 'School Details',
          icon: Icons.school_rounded,
          onEdit: () => onEditStep(0),
          children: [
            _ReviewInfoRow('School name', data.name),
            _ReviewInfoRow('School type', data.type),
            _ReviewInfoRow('Primary operator', data.operatorName),
            _ReviewInfoRow('Primary phone', data.phone),
            if (data.additionalOperators.isNotEmpty)
              _ReviewInfoRow(
                'Additional operators',
                data.additionalOperators.join('\n'),
              ),
          ],
        ),
        _ReviewSection(
          title: 'Location',
          icon: Icons.location_on_rounded,
          onEdit: () => onEditStep(1),
          children: [
            _ReviewInfoRow('State', data.state),
            _ReviewInfoRow('LGA', data.lga),
            _ReviewInfoRow('Ward', data.ward),
            _ReviewInfoRow('Community', data.community),
            _ReviewInfoRow('Landmark', data.landmark),
            _ReviewInfoRow('GPS', '${data.latitude}, ${data.longitude}'),
          ],
        ),
        _ReviewSection(
          title: 'Photo Documentation',
          icon: Icons.photo_library_rounded,
          onEdit: () => onEditStep(2),
          children: [_PhotoReviewGrid(photos: photos)],
        ),
        _ReviewSection(
          title: 'Students',
          icon: Icons.groups_rounded,
          onEdit: () => onEditStep(3),
          children: [
            _ReviewMetricWrap(
              metrics: [
                _ReviewMetric('Total', data.totalChildren),
                _ReviewMetric('Resident', data.residentChildren),
                _ReviewMetric('Non-resident', data.nonResidentChildren),
                _ReviewMetric('Boys', data.boys),
                _ReviewMetric('Girls', data.girls),
              ],
            ),
            _ReviewInfoRow('Age groups', data.ageGroups.join(', ')),
            _ReviewInfoRow('Population notes', data.populationNotes),
          ],
        ),
        _ReviewSection(
          title: 'Welfare Assessment',
          icon: Icons.volunteer_activism_rounded,
          onEdit: () => onEditStep(4),
          children: [
            _ReviewMetricWrap(
              metrics: [
                _ReviewMetric('Meals/day', data.mealsPerDay),
                _ReviewMetric('Water', data.waterSource),
              ],
            ),
            _ReviewInfoRow('Toilet / latrine access', data.toiletAccess),
            _ReviewInfoRow('Adequate clothing', data.adequateClothing),
            _ReviewInfoRow('Healthcare access', data.healthcareAccess),
            _ReviewInfoRow('Sleeping arrangement', data.sleepingArrangement),
            _ReviewInfoRow('Hygiene condition', data.hygieneCondition),
            _ReviewInfoRow('Additional note', data.welfareNotes),
          ],
        ),
        _ReviewSection(
          title: 'Needs & Priorities',
          icon: Icons.priority_high_rounded,
          onEdit: () => onEditStep(5),
          children: [
            _NeedsSummary(needs: data.needs),
            const SizedBox(height: 12),
            _UrgencySummary(urgency: data.urgency),
          ],
        ),
        const SizedBox(height: 4),
        OutlinedButton.icon(
          onPressed: submitting ? null : onSyncLater,
          icon: const Icon(Icons.sync_problem_rounded),
          label: const Text('Sync later'),
        ),
      ],
    );
  }
}

class AddSiteReviewData {
  const AddSiteReviewData({
    required this.name,
    required this.type,
    required this.operatorName,
    required this.phone,
    required this.additionalOperators,
    required this.state,
    required this.lga,
    required this.ward,
    required this.community,
    required this.landmark,
    required this.latitude,
    required this.longitude,
    required this.totalChildren,
    required this.residentChildren,
    required this.nonResidentChildren,
    required this.boys,
    required this.girls,
    required this.ageGroups,
    required this.populationNotes,
    required this.mealsPerDay,
    required this.waterSource,
    required this.toiletAccess,
    required this.adequateClothing,
    required this.healthcareAccess,
    required this.sleepingArrangement,
    required this.hygieneCondition,
    required this.welfareNotes,
    required this.needs,
    required this.urgency,
  });

  final String name;
  final String type;
  final String operatorName;
  final String phone;
  final List<String> additionalOperators;
  final String state;
  final String lga;
  final String ward;
  final String community;
  final String landmark;
  final String latitude;
  final String longitude;
  final String totalChildren;
  final String residentChildren;
  final String nonResidentChildren;
  final String boys;
  final String girls;
  final List<String> ageGroups;
  final String populationNotes;
  final String mealsPerDay;
  final String waterSource;
  final String toiletAccess;
  final String adequateClothing;
  final String healthcareAccess;
  final String sleepingArrangement;
  final String hygieneCondition;
  final String welfareNotes;
  final List<NeedType> needs;
  final UrgencyLevel urgency;
}

class _ReviewSection extends StatelessWidget {
  const _ReviewSection({
    required this.title,
    required this.icon,
    required this.children,
    required this.onEdit,
  });

  final String title;
  final IconData icon;
  final List<Widget> children;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                width: 34,
                height: 34,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.paleGreen,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: AppColors.deepGreen, size: 19),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.ink,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              TextButton.icon(
                onPressed: onEdit,
                icon: const Icon(Icons.edit_rounded, size: 18),
                label: const Text('Edit'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }
}

class _ReviewInfoRow extends StatelessWidget {
  const _ReviewInfoRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final cleanValue = value.trim();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final compact = constraints.maxWidth < 440;
          final labelWidget = Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          );
          final valueWidget = Text(
            cleanValue.isEmpty ? 'Not provided' : cleanValue,
            style: const TextStyle(
              color: AppColors.ink,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          );

          if (compact) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [labelWidget, const SizedBox(height: 3), valueWidget],
            );
          }

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(width: 150, child: labelWidget),
              Expanded(child: valueWidget),
            ],
          );
        },
      ),
    );
  }
}

class _ReviewMetricWrap extends StatelessWidget {
  const _ReviewMetricWrap({required this.metrics});

  final List<_ReviewMetric> metrics;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final columnCount = constraints.maxWidth >= 620
              ? 4
              : constraints.maxWidth >= 420
              ? 2
              : 1;
          final spacing = 8.0;
          final width =
              (constraints.maxWidth - spacing * (columnCount - 1)) /
              columnCount;

          return Wrap(
            spacing: spacing,
            runSpacing: spacing,
            children: [
              for (final metric in metrics)
                SizedBox(
                  width: width,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.scaffold,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          metric.label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.muted,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          metric.value.trim().isEmpty
                              ? 'Not provided'
                              : metric.value,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: AppColors.ink,
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _ReviewMetric {
  const _ReviewMetric(this.label, this.value);

  final String label;
  final String value;
}

class _PhotoReviewGrid extends StatelessWidget {
  const _PhotoReviewGrid({required this.photos});

  final List<SitePhotoDraft> photos;

  @override
  Widget build(BuildContext context) {
    if (photos.isEmpty) {
      return const Text(
        'No photos selected.',
        style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final columnCount = constraints.maxWidth >= 700
            ? 4
            : constraints.maxWidth >= 480
            ? 3
            : 2;
        final spacing = 10.0;
        final width =
            (constraints.maxWidth - spacing * (columnCount - 1)) / columnCount;

        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: [
            for (final entry in photos.indexed)
              SizedBox(
                width: width,
                child: _PhotoReviewTile(index: entry.$1, photo: entry.$2),
              ),
          ],
        );
      },
    );
  }
}

class _PhotoReviewTile extends StatelessWidget {
  const _PhotoReviewTile({required this.index, required this.photo});

  final int index;
  final SitePhotoDraft photo;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: AppColors.scaffold,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.line),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AspectRatio(
              aspectRatio: 1.25,
              child: FutureBuilder<Uint8List>(
                future: photo.file.readAsBytes(),
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    return Image.memory(snapshot.data!, fit: BoxFit.cover);
                  }
                  return Container(
                    color: AppColors.paleGreen,
                    alignment: Alignment.center,
                    child: const Icon(
                      Icons.image_rounded,
                      color: AppColors.deepGreen,
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(9),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Photo ${index + 1}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.ink,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    photo.category?.label ?? 'No category',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NeedsSummary extends StatelessWidget {
  const _NeedsSummary({required this.needs});

  final List<NeedType> needs;

  @override
  Widget build(BuildContext context) {
    if (needs.isEmpty) {
      return const Text(
        'No needs selected.',
        style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w700),
      );
    }

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final need in needs)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.paleGreen,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.onboardingGreen),
            ),
            child: Text(
              need.label,
              style: const TextStyle(
                color: AppColors.deepGreen,
                fontSize: 12,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
      ],
    );
  }
}

class _UrgencySummary extends StatelessWidget {
  const _UrgencySummary({required this.urgency});

  final UrgencyLevel urgency;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7D6),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.amber),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(_urgencyIcon, color: AppColors.orange, size: 20),
          const SizedBox(width: 8),
          Text(
            '${urgency.label} urgency',
            style: const TextStyle(
              color: AppColors.ink,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }

  IconData get _urgencyIcon {
    return switch (urgency) {
      UrgencyLevel.low => Icons.flag_outlined,
      UrgencyLevel.medium => Icons.priority_high_rounded,
      UrgencyLevel.high => Icons.warning_amber_rounded,
    };
  }
}
