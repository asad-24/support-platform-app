import 'app_enums.dart';

class MediaFile {
  const MediaFile({
    required this.id,
    required this.siteId,
    this.fileUrl,
    this.localPath,
    required this.type,
    required this.timestamp,
    this.latitude,
    this.longitude,
    required this.uploadedBy,
  });

  final String id;
  final String siteId;
  final String? fileUrl;
  final String? localPath;
  final MediaType type;
  final DateTime timestamp;
  final double? latitude;
  final double? longitude;
  final String uploadedBy;

  factory MediaFile.fromJson(Map<String, dynamic> json) {
    return MediaFile(
      id: json['id'] as String,
      siteId: json['siteId'] as String,
      fileUrl: json['fileUrl'] as String?,
      localPath: json['localPath'] as String?,
      type: MediaType.fromJson(json['type'] as String? ?? 'other'),
      timestamp: DateTime.parse(json['timestamp'] as String),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      uploadedBy: json['uploadedBy'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'siteId': siteId,
    'fileUrl': fileUrl,
    'localPath': localPath,
    'type': type.toJson(),
    'timestamp': timestamp.toIso8601String(),
    'latitude': latitude,
    'longitude': longitude,
    'uploadedBy': uploadedBy,
  };
}
