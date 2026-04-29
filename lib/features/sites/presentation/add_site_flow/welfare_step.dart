import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import 'form_fields.dart';
import 'shared_widgets.dart';

class WelfareStep extends StatelessWidget {
  const WelfareStep({
    super.key,
    required this.feedingController,
    required this.shelterController,
    required this.sanitationController,
    required this.waterController,
    required this.healthController,
    required this.clothingController,
    required this.hygieneController,
    required this.welfareNotesController,
  });

  static const waterSources = [
    'Tap water',
    'Borehole',
    'Well',
    'Purchased water',
  ];
  static const sleepingArrangements = [
    'Dedicated dormitory',
    'Shared open space',
    'Mosque / prayer hall',
    'No fixed arrangement',
  ];
  static const hygieneConditions = [
    'Good',
    'Adequate',
    'Below standard',
    'Poor',
  ];

  final TextEditingController feedingController;
  final TextEditingController shelterController;
  final TextEditingController sanitationController;
  final TextEditingController waterController;
  final TextEditingController healthController;
  final TextEditingController clothingController;
  final TextEditingController hygieneController;
  final TextEditingController welfareNotesController;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AddSiteFormSectionHeader(
          title: 'Nutrition & Water',
          description: 'Daily meals and clear water access.',
        ),
        _MealsPerDaySelector(controller: feedingController),
        AddSiteLabeledDropdownField(
          heading: 'Water Source',
          hintText: 'Select water source',
          items: waterSources,
          value: _validValue(waterController.text, waterSources),
          onChanged: (value) => waterController.text = value ?? '',
          required: true,
        ),
        const SizedBox(height: 4),
        const AddSiteFormSectionHeader(
          title: 'Living Conditions',
          description: 'Sanitation, clothing and shelter.',
        ),
        _WelfareToggleField(
          controller: sanitationController,
          title: 'Toilet / Latrine Access',
          description: 'Are functioning toilets available on site?',
        ),
        _WelfareToggleField(
          controller: clothingController,
          title: 'Adequate Clothing',
          description: 'Do children have sufficient seasonal clothing?',
        ),
        _WelfareToggleField(
          controller: healthController,
          title: 'Healthcare Access',
          description: 'Can children access healthcare when ill?',
        ),
        const SizedBox(height: 2),
        AddSiteLabeledDropdownField(
          heading: 'Sleeping Arrangement',
          hintText: 'Select arrangement type',
          items: sleepingArrangements,
          value: _validValue(shelterController.text, sleepingArrangements),
          onChanged: (value) => shelterController.text = value ?? '',
          required: true,
        ),
        AddSiteLabeledDropdownField(
          heading: 'Hygiene Condition',
          hintText: 'Assess overall hygiene',
          items: hygieneConditions,
          value: _validValue(hygieneController.text, hygieneConditions),
          onChanged: (value) => hygieneController.text = value ?? '',
          required: true,
        ),
        const SizedBox(height: 4),
        const AddSiteFormSectionHeader(
          title: 'Additional Note',
          description: 'Any observation not captured above.',
        ),
        AddSiteLabeledTextField(
          controller: welfareNotesController,
          heading: 'Observation',
          hintText: 'Add relevant observation, context or recommendations',
          maxLines: 3,
        ),
      ],
    );
  }

  static String? _validValue(String value, List<String> options) {
    final normalized = value.trim();
    return options.contains(normalized) ? normalized : null;
  }
}

class _MealsPerDaySelector extends StatelessWidget {
  const _MealsPerDaySelector({required this.controller});

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: FormField<String>(
        key: ValueKey('meals-${controller.text}'),
        initialValue: _validMealValue(controller.text),
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Meals per day is required';
          }
          return null;
        },
        builder: (field) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const AddSiteFieldHeading(text: 'Meals per day', required: true),
              const SizedBox(height: 8),
              Row(
                children: [
                  for (final meal in const ['0', '1', '2', '3']) ...[
                    Expanded(
                      child: _MealBox(
                        label: meal,
                        selected: field.value == meal,
                        onTap: () {
                          controller.text = meal;
                          field.didChange(meal);
                        },
                      ),
                    ),
                    if (meal != '3') const SizedBox(width: 8),
                  ],
                ],
              ),
              if (field.hasError) ...[
                const SizedBox(height: 8),
                Text(
                  field.errorText!,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.error,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }

  String? _validMealValue(String value) {
    final normalized = value.trim();
    return const ['0', '1', '2', '3'].contains(normalized) ? normalized : null;
  }
}

class _MealBox extends StatelessWidget {
  const _MealBox({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        height: 48,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? AppColors.deepGreen : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? AppColors.deepGreen : AppColors.line,
            width: selected ? 1.6 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: AppColors.deepGreen.withValues(alpha: 0.14),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : AppColors.ink,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}

class _WelfareToggleField extends StatelessWidget {
  const _WelfareToggleField({
    required this.controller,
    required this.title,
    required this.description,
  });

  final TextEditingController controller;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<TextEditingValue>(
      valueListenable: controller,
      builder: (context, value, _) {
        final selected = value.text == 'true';
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.line),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        color: AppColors.ink,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              _GradientToggle(
                selected: selected,
                onTap: () => controller.text = selected ? 'false' : 'true',
              ),
            ],
          ),
        );
      },
    );
  }
}

class _GradientToggle extends StatelessWidget {
  const _GradientToggle({required this.selected, required this.onTap});

  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      toggled: selected,
      label: selected ? 'Turn off' : 'Turn on',
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          width: 66,
          height: 34,
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            gradient: selected
                ? const LinearGradient(
                    colors: [
                      AppColors.onboardingCardGreen,
                      AppColors.deepGreen,
                    ],
                  )
                : null,
            color: selected ? null : const Color(0xFFE7EAEE),
            borderRadius: BorderRadius.circular(999),
          ),
          child: AnimatedAlign(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOut,
            alignment: selected ? Alignment.centerRight : Alignment.centerLeft,
            child: Container(
              width: 26,
              height: 26,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
