import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../../core/storage/storage_providers.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/dashboard_summary.dart';
import '../../../shared/models/media_file.dart';
import '../../../shared/models/population_summary.dart';
import '../../../shared/models/site.dart';
import '../../../shared/models/site_draft.dart';
import '../../../shared/models/welfare_assessment.dart';

final sitesRepositoryProvider = Provider<SitesRepository>((ref) {
  return MockSitesRepository();
});

final sitesProvider = FutureProvider.autoDispose<List<Site>>((ref) {
  return ref.watch(sitesRepositoryProvider).getSites();
});

final dashboardSummaryProvider = FutureProvider.autoDispose<DashboardSummary>((
  ref,
) {
  return ref.watch(sitesRepositoryProvider).getDashboardSummary();
});

final draftsProvider = FutureProvider.autoDispose<List<SiteDraft>>((ref) {
  return ref.watch(localDraftStorageProvider).all();
});

final submittedSitesProvider = FutureProvider.autoDispose
    .family<List<Site>, String>((ref, userId) {
      return ref.watch(sitesRepositoryProvider).getSubmittedSites(userId);
    });

abstract class SitesRepository {
  Future<List<Site>> getSites({
    String? query,
    VerificationStatus? verificationStatus,
    UrgencyLevel? urgencyLevel,
    NeedType? need,
  });

  Future<List<Site>> getSubmittedSites(String userId);

  Future<Site> getSite(String id);

  Future<Site> createSite(Map<String, dynamic> payload);

  Future<Site> updateSite(String id, Map<String, dynamic> payload);

  Future<MediaFile> uploadMedia(String siteId, MediaFile file);

  Future<WelfareAssessment> submitAssessment(
    String siteId,
    WelfareAssessment assessment,
  );

  Future<DashboardSummary> getDashboardSummary();

  Future<String> exportSitesCsv();
}

class MockSitesRepository implements SitesRepository {
  MockSitesRepository() : _sites = _seedSites();

  static const _uuid = Uuid();
  final List<Site> _sites;

  @override
  Future<List<Site>> getSites({
    String? query,
    VerificationStatus? verificationStatus,
    UrgencyLevel? urgencyLevel,
    NeedType? need,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 250));
    Iterable<Site> result = _sites;

    final normalizedQuery = query?.trim().toLowerCase();
    if (normalizedQuery != null && normalizedQuery.isNotEmpty) {
      result = result.where((site) {
        return site.name.toLowerCase().contains(normalizedQuery) ||
            site.uniqueSiteId.toLowerCase().contains(normalizedQuery) ||
            site.community.toLowerCase().contains(normalizedQuery);
      });
    }
    if (verificationStatus != null) {
      result = result.where(
        (site) => site.verificationStatus == verificationStatus,
      );
    }
    if (urgencyLevel != null) {
      result = result.where((site) => site.urgencyLevel == urgencyLevel);
    }
    if (need != null) {
      result = result.where((site) => site.needs.contains(need));
    }

    return result.toList()..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
  }

  @override
  Future<Site> getSite(String id) async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    return _sites.firstWhere((site) => site.id == id);
  }

  @override
  Future<List<Site>> getSubmittedSites(String userId) async {
    await Future<void>.delayed(const Duration(milliseconds: 250));
    return _sites.where((site) => site.createdBy == userId).toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
  }

  @override
  Future<Site> createSite(Map<String, dynamic> payload) async {
    await Future<void>.delayed(const Duration(milliseconds: 700));
    final now = DateTime.now();
    final site = Site(
      id: _uuid.v4(),
      uniqueSiteId: 'SSA-${now.millisecondsSinceEpoch.toString().substring(6)}',
      name: payload['name'] as String,
      localName: payload['localName'] as String?,
      type: payload['type'] as String? ?? 'Learning Centre',
      operatorName: payload['operatorName'] as String? ?? '',
      phone: payload['phone'] as String? ?? '',
      country: payload['country'] as String? ?? 'Nigeria',
      state: payload['state'] as String? ?? '',
      lga: payload['lga'] as String? ?? '',
      ward: payload['ward'] as String? ?? '',
      community: payload['community'] as String? ?? '',
      landmark: payload['landmark'] as String?,
      latitude: (payload['latitude'] as num?)?.toDouble() ?? 9.082,
      longitude: (payload['longitude'] as num?)?.toDouble() ?? 8.6753,
      verificationStatus: VerificationStatus.pending,
      reviewStatus: SubmissionReviewStatus.pendingVerification,
      urgencyLevel: UrgencyLevel.fromJson(
        payload['urgencyLevel'] as String? ?? 'low',
      ),
      createdBy: payload['createdBy'] as String? ?? 'field-001',
      createdAt: now,
      updatedAt: now,
      populationSummary: payload['populationSummary'] == null
          ? PopulationSummary.empty()
          : PopulationSummary.fromJson(
              Map<String, dynamic>.from(payload['populationSummary'] as Map),
            ),
      welfareAssessment: payload['welfareAssessment'] == null
          ? WelfareAssessment.empty()
          : WelfareAssessment.fromJson(
              Map<String, dynamic>.from(payload['welfareAssessment'] as Map),
            ),
      media: (payload['media'] as List? ?? const [])
          .map(
            (item) =>
                MediaFile.fromJson(Map<String, dynamic>.from(item as Map)),
          )
          .toList(),
      needs: (payload['needs'] as List? ?? const [])
          .map((item) => NeedType.fromJson(item as String))
          .toList(),
    );
    _sites.add(site);
    return site;
  }

  @override
  Future<Site> updateSite(String id, Map<String, dynamic> payload) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    final index = _sites.indexWhere((site) => site.id == id);
    final existing = _sites[index];
    final updated = Site(
      id: existing.id,
      uniqueSiteId: existing.uniqueSiteId,
      name: payload['name'] as String? ?? existing.name,
      localName: payload['localName'] as String? ?? existing.localName,
      type: payload['type'] as String? ?? existing.type,
      operatorName: payload['operatorName'] as String? ?? existing.operatorName,
      phone: payload['phone'] as String? ?? existing.phone,
      country: payload['country'] as String? ?? existing.country,
      state: payload['state'] as String? ?? existing.state,
      lga: payload['lga'] as String? ?? existing.lga,
      ward: payload['ward'] as String? ?? existing.ward,
      community: payload['community'] as String? ?? existing.community,
      landmark: payload['landmark'] as String? ?? existing.landmark,
      latitude: (payload['latitude'] as num?)?.toDouble() ?? existing.latitude,
      longitude:
          (payload['longitude'] as num?)?.toDouble() ?? existing.longitude,
      verificationStatus: existing.needsCorrection
          ? VerificationStatus.pending
          : existing.verificationStatus,
      reviewStatus: existing.needsCorrection
          ? SubmissionReviewStatus.pendingVerification
          : existing.reviewStatus,
      urgencyLevel: payload['urgencyLevel'] == null
          ? existing.urgencyLevel
          : UrgencyLevel.fromJson(payload['urgencyLevel'] as String),
      createdBy: existing.createdBy,
      createdAt: existing.createdAt,
      updatedAt: DateTime.now(),
      populationSummary: payload['populationSummary'] == null
          ? existing.populationSummary
          : PopulationSummary.fromJson(
              Map<String, dynamic>.from(payload['populationSummary'] as Map),
            ),
      welfareAssessment: payload['welfareAssessment'] == null
          ? existing.welfareAssessment
          : WelfareAssessment.fromJson(
              Map<String, dynamic>.from(payload['welfareAssessment'] as Map),
            ),
      media: (payload['media'] as List? ?? existing.media)
          .map(
            (item) => item is MediaFile
                ? item
                : MediaFile.fromJson(Map<String, dynamic>.from(item as Map)),
          )
          .toList(),
      needs: (payload['needs'] as List? ?? existing.needs)
          .map(
            (item) =>
                item is NeedType ? item : NeedType.fromJson(item as String),
          )
          .toList(),
      adminNotes: existing.needsCorrection ? null : existing.adminNotes,
      correctionIssues: existing.needsCorrection
          ? const []
          : existing.correctionIssues,
    );
    _sites[index] = updated;
    return updated;
  }

  @override
  Future<MediaFile> uploadMedia(String siteId, MediaFile file) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    return file;
  }

  @override
  Future<WelfareAssessment> submitAssessment(
    String siteId,
    WelfareAssessment assessment,
  ) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return assessment;
  }

  @override
  Future<DashboardSummary> getDashboardSummary() async {
    final sites = await getSites();
    return DashboardSummary(
      totalSites: sites.length,
      estimatedChildren: sites.fold<int>(
        0,
        (sum, site) => sum + (site.populationSummary?.totalChildren ?? 0),
      ),
      pendingVerification: sites
          .where(
            (site) => site.verificationStatus == VerificationStatus.pending,
          )
          .length,
      verifiedSites: sites
          .where(
            (site) => site.verificationStatus == VerificationStatus.verified,
          )
          .length,
      highUrgencySites: sites
          .where((site) => site.urgencyLevel == UrgencyLevel.high)
          .length,
    );
  }

  @override
  Future<String> exportSitesCsv() async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    final rows = [
      'uniqueSiteId,name,state,lga,community,verificationStatus,urgencyLevel,estimatedChildren',
      ..._sites.map(
        (site) =>
            '${site.uniqueSiteId},${site.name},${site.state},${site.lga},${site.community},${site.verificationStatus.name},${site.urgencyLevel.name},${site.populationSummary?.totalChildren ?? 0}',
      ),
    ];
    return rows.join('\n');
  }

  static List<Site> _seedSites() {
    final now = DateTime.now();
    return [
      Site(
        id: 'site-001',
        uniqueSiteId: 'SSA-KD-0001',
        name: 'Tudun Wada Learning Centre',
        localName: 'Makarantar Tudun Wada',
        type: 'Informal learning centre',
        operatorName: 'Malam Yusuf Garba',
        phone: '+2348012345678',
        state: 'Kaduna',
        lga: 'Kaduna North',
        ward: 'Unguwan Dosa',
        community: 'Tudun Wada',
        landmark: 'Near central mosque',
        latitude: 10.5222,
        longitude: 7.4383,
        verificationStatus: VerificationStatus.pending,
        reviewStatus: SubmissionReviewStatus.pendingVerification,
        urgencyLevel: UrgencyLevel.high,
        createdBy: 'field-001',
        createdAt: now.subtract(const Duration(days: 8)),
        updatedAt: now.subtract(const Duration(days: 1)),
        populationSummary: const PopulationSummary(
          totalChildren: 86,
          residentChildren: 52,
          nonResidentChildren: 34,
          age0to5: 6,
          age6to9: 29,
          age10to14: 41,
          age15plus: 10,
          notes: 'Aggregate counts only. No child-identifiable data captured.',
        ),
        welfareAssessment: const WelfareAssessment(
          feedingStatus: 'Irregular meals',
          shelterStatus: 'Overcrowded sleeping area',
          sanitationStatus: 'Poor latrine access',
          waterAccess: 'Shared borehole nearby',
          healthAccess: 'No regular outreach',
          clothingStatus: 'Insufficient',
          safetyRisks: 'Open drainage near sleeping area',
          immediateInterventionNeeded: true,
          urgencyReason:
              'Feeding, sanitation, and bedding support needed within two weeks.',
        ),
        needs: const [
          NeedType.feeding,
          NeedType.bedding,
          NeedType.sanitation,
          NeedType.safeguarding,
        ],
      ),
      Site(
        id: 'site-002',
        uniqueSiteId: 'SSA-KN-0002',
        name: 'Sabon Gari Quranic School',
        type: 'Almajiri-style centre',
        operatorName: 'Malam Ibrahim Sani',
        phone: '+2348098765432',
        state: 'Kano',
        lga: 'Fagge',
        ward: 'Sabon Gari',
        community: 'Kantin Kwari',
        latitude: 12.0001,
        longitude: 8.5167,
        verificationStatus: VerificationStatus.verified,
        reviewStatus: SubmissionReviewStatus.approved,
        urgencyLevel: UrgencyLevel.medium,
        createdBy: 'field-001',
        createdAt: now.subtract(const Duration(days: 30)),
        updatedAt: now.subtract(const Duration(days: 4)),
        populationSummary: const PopulationSummary(
          totalChildren: 43,
          residentChildren: 18,
          nonResidentChildren: 25,
          age0to5: 2,
          age6to9: 14,
          age10to14: 22,
          age15plus: 5,
        ),
        welfareAssessment: const WelfareAssessment(
          feedingStatus: 'Community-supported',
          shelterStatus: 'Basic but stable',
          sanitationStatus: 'Functional shared latrine',
          waterAccess: 'Reliable tap',
          healthAccess: 'Occasional clinic referral',
          clothingStatus: 'Mixed',
          immediateInterventionNeeded: false,
        ),
        needs: const [NeedType.educationMaterials, NeedType.healthOutreach],
      ),
      Site(
        id: 'site-003',
        uniqueSiteId: 'SSA-KN-0003',
        name: 'Makaranta Jibril',
        type: 'Traditional Quranic School',
        operatorName: 'Malam Jibril Musa',
        phone: '+2348065432109',
        state: 'Kano',
        lga: 'Kumbotso',
        ward: 'Panshekara',
        community: 'Kumbotso',
        landmark: 'Beside market road',
        latitude: 11.8901,
        longitude: 8.5042,
        verificationStatus: VerificationStatus.rejected,
        reviewStatus: SubmissionReviewStatus.needsCorrection,
        urgencyLevel: UrgencyLevel.high,
        createdBy: 'field-001',
        createdAt: now.subtract(const Duration(days: 12)),
        updatedAt: now.subtract(const Duration(hours: 8)),
        populationSummary: const PopulationSummary(
          totalChildren: 44,
          residentChildren: 20,
          nonResidentChildren: 24,
          boys: 29,
          girls: 15,
          age0to5: 0,
          age6to9: 13,
          age10to14: 24,
          age15plus: 7,
          ageGroups: ['6-9', '10-14', '15+'],
        ),
        welfareAssessment: const WelfareAssessment(
          feedingStatus: '1 meal per day',
          shelterStatus: 'Shared sleeping space',
          sanitationStatus: 'No functional toilet/latrine available',
          waterAccess: 'Open well nearby',
          healthAccess: 'No healthcare access',
          clothingStatus: 'Inadequate clothing',
          mealsPerDay: 1,
          waterSource: 'Open well nearby',
          hasToiletAccess: false,
          hasAdequateClothing: false,
          hasHealthcareAccess: false,
          sleepingArrangement: 'Shared sleeping space',
          hygieneCondition: 'Poor',
          notes: 'Needs admin correction before publication.',
        ),
        needs: const [NeedType.feeding, NeedType.sanitation],
        adminNotes:
            'Admin review found incomplete location and welfare evidence.',
        correctionIssues: const [
          CorrectionIssue(
            fieldKey: 'landmark',
            stepIndex: 1,
            message: 'Add a clearer nearby landmark for verification.',
          ),
          CorrectionIssue(
            fieldKey: 'waterSource',
            stepIndex: 4,
            message: 'Clarify the water source and current access condition.',
          ),
        ],
      ),
    ];
  }
}
