import 'package:flutter/material.dart';

import 'form_fields.dart';
import 'models.dart';
import 'shared_widgets.dart';

class SchoolDetailsStep extends StatelessWidget {
  const SchoolDetailsStep({
    super.key,
    required this.schoolTypes,
    required this.nameController,
    required this.typeController,
    required this.primaryOperatorNameController,
    required this.primaryOperatorPhoneController,
    required this.additionalOperators,
    required this.onAddOperator,
    required this.onRemoveOperator,
  });

  final List<String> schoolTypes;
  final TextEditingController nameController;
  final TextEditingController typeController;
  final TextEditingController primaryOperatorNameController;
  final TextEditingController primaryOperatorPhoneController;
  final List<OperatorContactFields> additionalOperators;
  final VoidCallback onAddOperator;
  final ValueChanged<int> onRemoveOperator;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AddSiteFormSectionHeader(
          title: 'School Identification',
          description: 'Enter the official data of school.',
        ),
        AddSiteLabeledTextField(
          controller: nameController,
          heading: 'School Name',
          hintText: 'Official Name of School',
          required: true,
        ),
        AddSiteLabeledDropdownField(
          heading: 'School Type',
          hintText: 'Select School Type',
          items: schoolTypes,
          value: schoolTypes.contains(typeController.text)
              ? typeController.text
              : null,
          required: true,
          onChanged: (value) => typeController.text = value ?? '',
        ),
        const SizedBox(height: 4),
        AddSiteSectionHeaderWithAction(
          title: 'Operator Details',
          description:
              'Information about the Mallam or person running the school.',
          actionLabel: 'Add',
          onPressed: onAddOperator,
        ),
        AddSiteOperatorContactCard(
          index: 0,
          nameController: primaryOperatorNameController,
          phoneController: primaryOperatorPhoneController,
          required: true,
        ),
        ...List.generate(additionalOperators.length, (index) {
          final entry = additionalOperators[index];
          return AddSiteOperatorContactCard(
            index: index + 1,
            nameController: entry.name,
            phoneController: entry.phone,
            onRemove: () => onRemoveOperator(index),
          );
        }),
      ],
    );
  }
}
