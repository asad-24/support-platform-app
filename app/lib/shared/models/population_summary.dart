class PopulationSummary {
  const PopulationSummary({
    required this.totalChildren,
    required this.residentChildren,
    required this.nonResidentChildren,
    required this.age0to5,
    required this.age6to9,
    required this.age10to14,
    required this.age15plus,
    this.boys = 0,
    this.girls = 0,
    this.ageGroups = const [],
    this.notes,
  });

  final int totalChildren;
  final int residentChildren;
  final int nonResidentChildren;
  final int age0to5;
  final int age6to9;
  final int age10to14;
  final int age15plus;
  final int boys;
  final int girls;
  final List<String> ageGroups;
  final String? notes;

  factory PopulationSummary.empty() => const PopulationSummary(
    totalChildren: 0,
    residentChildren: 0,
    nonResidentChildren: 0,
    age0to5: 0,
    age6to9: 0,
    age10to14: 0,
    age15plus: 0,
  );

  factory PopulationSummary.fromJson(Map<String, dynamic> json) {
    return PopulationSummary(
      totalChildren: json['totalChildren'] as int? ?? 0,
      residentChildren: json['residentChildren'] as int? ?? 0,
      nonResidentChildren: json['nonResidentChildren'] as int? ?? 0,
      age0to5: json['age0to5'] as int? ?? 0,
      age6to9: json['age6to9'] as int? ?? 0,
      age10to14: json['age10to14'] as int? ?? 0,
      age15plus: json['age15plus'] as int? ?? 0,
      boys: json['boys'] as int? ?? 0,
      girls: json['girls'] as int? ?? 0,
      ageGroups: List<String>.from(json['ageGroups'] as List? ?? const []),
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'totalChildren': totalChildren,
    'residentChildren': residentChildren,
    'nonResidentChildren': nonResidentChildren,
    'age0to5': age0to5,
    'age6to9': age6to9,
    'age10to14': age10to14,
    'age15plus': age15plus,
    'boys': boys,
    'girls': girls,
    'ageGroups': ageGroups,
    'notes': notes,
  };
}
