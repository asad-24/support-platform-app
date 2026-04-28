import 'app_enums.dart';
import 'media_file.dart';
import 'population_summary.dart';
import 'welfare_assessment.dart';

class Site {
  const Site({
    required this.id,
    required this.uniqueSiteId,
    required this.name,
    this.localName,
    required this.type,
    required this.operatorName,
    required this.phone,
    this.country = 'Nigeria',
    required this.state,
    required this.lga,
    required this.ward,
    required this.community,
    this.landmark,
    required this.latitude,
    required this.longitude,
    required this.verificationStatus,
    required this.urgencyLevel,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
    this.populationSummary,
    this.welfareAssessment,
    this.media = const [],
    this.needs = const [],
    this.adminNotes,
  });

  final String id;
  final String uniqueSiteId;
  final String name;
  final String? localName;
  final String type;
  final String operatorName;
  final String phone;
  final String country;
  final String state;
  final String lga;
  final String ward;
  final String community;
  final String? landmark;
  final double latitude;
  final double longitude;
  final VerificationStatus verificationStatus;
  final UrgencyLevel urgencyLevel;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final PopulationSummary? populationSummary;
  final WelfareAssessment? welfareAssessment;
  final List<MediaFile> media;
  final List<NeedType> needs;
  final String? adminNotes;

  factory Site.fromJson(Map<String, dynamic> json) {
    return Site(
      id: json['id'] as String,
      uniqueSiteId: json['uniqueSiteId'] as String,
      name: json['name'] as String,
      localName: json['localName'] as String?,
      type: json['type'] as String? ?? 'Learning Centre',
      operatorName: json['operatorName'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      country: json['country'] as String? ?? 'Nigeria',
      state: json['state'] as String? ?? '',
      lga: json['lga'] as String? ?? '',
      ward: json['ward'] as String? ?? '',
      community: json['community'] as String? ?? '',
      landmark: json['landmark'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0,
      verificationStatus: VerificationStatus.fromJson(
        json['verificationStatus'] as String? ?? 'pending',
      ),
      urgencyLevel: UrgencyLevel.fromJson(
        json['urgencyLevel'] as String? ?? 'low',
      ),
      createdBy: json['createdBy'] as String? ?? '',
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      populationSummary: json['populationSummary'] == null
          ? null
          : PopulationSummary.fromJson(
              Map<String, dynamic>.from(json['populationSummary'] as Map),
            ),
      welfareAssessment: json['welfareAssessment'] == null
          ? null
          : WelfareAssessment.fromJson(
              Map<String, dynamic>.from(json['welfareAssessment'] as Map),
            ),
      media: (json['media'] as List? ?? const [])
          .map(
            (item) =>
                MediaFile.fromJson(Map<String, dynamic>.from(item as Map)),
          )
          .toList(),
      needs: (json['needs'] as List? ?? const [])
          .map((item) => NeedType.fromJson(item as String))
          .toList(),
      adminNotes: json['adminNotes'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'uniqueSiteId': uniqueSiteId,
    'name': name,
    'localName': localName,
    'type': type,
    'operatorName': operatorName,
    'phone': phone,
    'country': country,
    'state': state,
    'lga': lga,
    'ward': ward,
    'community': community,
    'landmark': landmark,
    'latitude': latitude,
    'longitude': longitude,
    'verificationStatus': verificationStatus.name,
    'urgencyLevel': urgencyLevel.name,
    'createdBy': createdBy,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
    'populationSummary': populationSummary?.toJson(),
    'welfareAssessment': welfareAssessment?.toJson(),
    'media': media.map((item) => item.toJson()).toList(),
    'needs': needs.map((item) => item.toJson()).toList(),
    'adminNotes': adminNotes,
  };
}
