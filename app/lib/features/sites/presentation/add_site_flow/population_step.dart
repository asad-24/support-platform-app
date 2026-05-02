import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';
import 'form_fields.dart';
import 'shared_widgets.dart';

class PopulationStep extends StatelessWidget {
  const PopulationStep({
    super.key,
    required this.totalChildrenController,
    required this.residentChildrenController,
    required this.nonResidentChildrenController,
    required this.boysController,
    required this.girlsController,
    required this.selectedAgeGroups,
    required this.onAgeGroupToggled,
    required this.populationNotesController,
  });

  final TextEditingController totalChildrenController;
  final TextEditingController residentChildrenController;
  final TextEditingController nonResidentChildrenController;
  final TextEditingController boysController;
  final TextEditingController girlsController;
  final Set<String> selectedAgeGroups;
  final void Function(String ageGroup, bool selected) onAgeGroupToggled;
  final TextEditingController populationNotesController;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AddSiteFormSectionHeader(
          title: 'Population Totals',
          description: 'Estimated counts of children at school.',
        ),
        AddSiteNumberGrid(
          controllers: [
            totalChildrenController,
            residentChildrenController,
            nonResidentChildrenController,
          ],
          labels: const [
            'Estimated Total Students',
            'Resident on Site',
            'Non-Resident',
          ],
          requiredFields: const [true, false, false],
        ),
        const SizedBox(height: 4),
        const AddSiteFormSectionHeader(
          title: 'Gender Specified',
          description: 'Estimated boys and girls counts where known.',
        ),
        AddSiteNumberGrid(
          controllers: [boysController, girlsController],
          labels: const ['Boys', 'Girls'],
          requiredFields: const [false, false],
        ),
        const SizedBox(height: 4),
        const AddSiteFormSectionHeader(
          title: 'Age Group',
          description: 'Select all age groups represented at the school.',
        ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _ageGroups.map((ageGroup) {
            final selected = selectedAgeGroups.contains(ageGroup);
            return FilterChip(
              label: Text(ageGroup),
              selected: selected,
              showCheckmark: false,
              backgroundColor: AppColors.elevatedSurface(context),
              selectedColor: AppColors.deepGreen,
              labelStyle: TextStyle(
                color: selected ? Colors.white : AppColors.primaryText(context),
                fontWeight: FontWeight.w700,
              ),
              side: BorderSide(
                color: selected
                    ? AppColors.deepGreen
                    : AppColors.border(context),
              ),
              onSelected: (value) => onAgeGroupToggled(ageGroup, value),
            );
          }).toList(),
        ),
        const SizedBox(height: 18),
        AddSiteLabeledTextField(
          controller: populationNotesController,
          heading: 'Population notes',
          hintText: 'Add any population notes',
          maxLines: 3,
        ),
      ],
    );
  }
}

const _ageGroups = ['5-8 years', '9-11 years', '13-17 years', '18+ years'];
