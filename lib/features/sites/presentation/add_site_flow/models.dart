import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../shared/models/app_enums.dart';

class FlowStepMeta {
  const FlowStepMeta({required this.title, required this.subtitle});

  final String title;
  final String subtitle;
}

class NigeriaStateOption {
  const NigeriaStateOption({required this.name, required this.lgas});

  final String name;
  final List<String> lgas;

  factory NigeriaStateOption.fromJson(Map<String, dynamic> json) {
    return NigeriaStateOption(
      name: json['name'] as String? ?? '',
      lgas: List<String>.from(json['lgas'] as List? ?? const []),
    );
  }
}

class OperatorContactFields {
  OperatorContactFields({
    TextEditingController? name,
    TextEditingController? phone,
  }) : name = name ?? TextEditingController(),
       phone = phone ?? TextEditingController();

  final TextEditingController name;
  final TextEditingController phone;

  void dispose() {
    name.dispose();
    phone.dispose();
  }
}

class SitePhotoDraft {
  const SitePhotoDraft({required this.file, this.category});

  final XFile file;
  final MediaType? category;

  SitePhotoDraft copyWith({MediaType? category}) {
    return SitePhotoDraft(file: file, category: category ?? this.category);
  }
}
