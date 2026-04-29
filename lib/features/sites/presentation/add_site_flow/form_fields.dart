import 'package:flutter/material.dart';

import '../../../../core/theme/app_theme.dart';

class AddSiteFieldHeading extends StatelessWidget {
  const AddSiteFieldHeading({
    super.key,
    required this.text,
    this.required = false,
  });

  final String text;
  final bool required;

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: TextStyle(
          color: AppColors.primaryText(context),
          fontSize: 14,
          fontWeight: FontWeight.w800,
        ),
        children: [
          TextSpan(text: text),
          if (required)
            const TextSpan(
              text: ' *',
              style: TextStyle(color: AppColors.danger),
            ),
        ],
      ),
    );
  }
}

class AddSiteLabeledTextField extends StatelessWidget {
  const AddSiteLabeledTextField({
    super.key,
    required this.controller,
    required this.heading,
    required this.hintText,
    this.required = false,
    this.maxLines = 1,
    this.keyboardType,
    this.prefixIcon,
  });

  final TextEditingController controller;
  final String heading;
  final String hintText;
  final bool required;
  final int maxLines;
  final TextInputType? keyboardType;
  final Widget? prefixIcon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AddSiteFieldHeading(text: heading, required: required),
          const SizedBox(height: 8),
          TextFormField(
            controller: controller,
            maxLines: maxLines,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              hintText: hintText,
              prefixIcon: prefixIcon,
            ),
            validator: required
                ? (value) {
                    if (value == null || value.trim().isEmpty) {
                      return '$heading is required';
                    }
                    return null;
                  }
                : null,
          ),
        ],
      ),
    );
  }
}

class AddSiteLabeledDropdownField extends StatelessWidget {
  const AddSiteLabeledDropdownField({
    super.key,
    required this.heading,
    required this.hintText,
    required this.items,
    required this.onChanged,
    this.value,
    this.required = false,
  });

  final String heading;
  final String hintText;
  final List<String> items;
  final ValueChanged<String?> onChanged;
  final String? value;
  final bool required;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AddSiteFieldHeading(text: heading, required: required),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            isExpanded: true,
            menuMaxHeight: MediaQuery.sizeOf(context).height * 0.46,
            initialValue: value,
            decoration: InputDecoration(hintText: hintText),
            items: items
                .map(
                  (item) => DropdownMenuItem<String>(
                    value: item,
                    child: Text(
                      item,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                )
                .toList(),
            onChanged: onChanged,
            validator: required
                ? (selected) {
                    if (selected == null || selected.trim().isEmpty) {
                      return '$heading is required';
                    }
                    return null;
                  }
                : null,
          ),
        ],
      ),
    );
  }
}

class AddSiteOperatorContactCard extends StatelessWidget {
  const AddSiteOperatorContactCard({
    super.key,
    required this.index,
    required this.nameController,
    required this.phoneController,
    this.required = false,
    this.onRemove,
  });

  final int index;
  final TextEditingController nameController;
  final TextEditingController phoneController;
  final bool required;
  final VoidCallback? onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: AppColors.isDark(context)
              ? [AppColors.elevatedSurface(context), AppColors.surface(context)]
              : const [Colors.white, Color(0xFFFBFDFC)],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border(context)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: AppColors.isDark(context) ? 0.18 : 0.04,
            ),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Text(
                'Operator ${index + 1}',
                style: TextStyle(
                  color: AppColors.primaryText(context),
                  fontWeight: FontWeight.w800,
                ),
              ),
              const Spacer(),
              if (onRemove != null)
                IconButton(
                  tooltip: 'Remove operator',
                  onPressed: onRemove,
                  icon: const Icon(Icons.close_rounded),
                ),
            ],
          ),
          const SizedBox(height: 6),
          AddSiteLabeledTextField(
            controller: nameController,
            heading: 'Operator / Mallam Name',
            hintText: 'Full name of the operator',
            required: required,
            prefixIcon: const Icon(Icons.person_outline_rounded),
          ),
          AddSiteLabeledTextField(
            controller: phoneController,
            heading: 'Phone Number',
            hintText: 'e.g 0803-456-7890',
            keyboardType: TextInputType.phone,
            prefixIcon: const Icon(Icons.call_outlined),
          ),
        ],
      ),
    );
  }
}

class AddSiteNumberGrid extends StatelessWidget {
  const AddSiteNumberGrid({
    super.key,
    required this.controllers,
    required this.labels,
    this.requiredFields,
  });

  final List<TextEditingController> controllers;
  final List<String> labels;
  final List<bool>? requiredFields;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final columnCount = constraints.maxWidth >= 840
            ? 3
            : constraints.maxWidth >= 520
            ? 2
            : 1;
        final totalSpacing = 10 * (columnCount - 1);
        final itemWidth = (constraints.maxWidth - totalSpacing) / columnCount;
        return Wrap(
          spacing: 10,
          runSpacing: 0,
          children: [
            for (var i = 0; i < controllers.length; i++)
              SizedBox(
                width: itemWidth,
                child: AddSiteLabeledTextField(
                  controller: controllers[i],
                  heading: labels[i],
                  hintText: 'Enter ${labels[i].toLowerCase()}',
                  required: requiredFields?[i] ?? true,
                  keyboardType: TextInputType.number,
                ),
              ),
          ],
        );
      },
    );
  }
}
