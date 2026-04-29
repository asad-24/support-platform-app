import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';

import '../../../core/storage/storage_providers.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../features/auth/presentation/auth_controller.dart';
import '../../../shared/models/app_enums.dart';
import '../../../shared/models/media_file.dart';
import '../../../shared/models/site_draft.dart';
import '../data/sites_repository.dart';
import 'add_site_flow/flow_timeline.dart';
import 'add_site_flow/location_step.dart';
import 'add_site_flow/models.dart';
import 'add_site_flow/nigeria_locations_service.dart';
import 'add_site_flow/needs_priorities_step.dart';
import 'add_site_flow/photos_review_step.dart';
import 'add_site_flow/population_step.dart';
import 'add_site_flow/review_step.dart';
import 'add_site_flow/school_details_step.dart';
import 'add_site_flow/shared_widgets.dart';
import 'add_site_flow/welfare_step.dart';

class AddSiteFlowScreen extends ConsumerStatefulWidget {
  const AddSiteFlowScreen({
    super.key,
    this.siteId,
    this.initialStep = 0,
    this.draftId,
    this.correctionOnly = false,
  });

  final String? siteId;
  final int initialStep;
  final String? draftId;
  final bool correctionOnly;

  @override
  ConsumerState<AddSiteFlowScreen> createState() => _AddSiteFlowScreenState();
}

class _AddSiteFlowScreenState extends ConsumerState<AddSiteFlowScreen> {
  static const _minPhotos = 2;
  static const _maxPhotos = 8;

  static const _schoolTypes = [
    'Traditional Quranic School',
    'Informal Islamic School',
    'Integrated Islamic School',
    'Non-Formal Education Center',
    'Community Islamic School',
  ];

  static const _flowSteps = [
    FlowStepMeta(
      title: 'School Details',
      subtitle: 'School identity and operator details.',
    ),
    FlowStepMeta(
      title: 'Location',
      subtitle: 'School address and GPS coordinates.',
    ),
    FlowStepMeta(
      title: 'Photo Documentation',
      subtitle: 'Upload 2-8 clear school environment photos.',
    ),
    FlowStepMeta(
      title: 'Students',
      subtitle: 'Estimated student totals, gender counts, and age groups.',
    ),
    FlowStepMeta(
      title: 'Welfare',
      subtitle: 'Nutrition, water, and living conditions.',
    ),
    FlowStepMeta(
      title: 'Needs & Priorities',
      subtitle: 'Intervention needs and follow-up urgency.',
    ),
    FlowStepMeta(
      title: 'Review',
      subtitle: 'Check the record before final submission.',
    ),
  ];

  final _formKey = GlobalKey<FormState>();
  final _uuid = const Uuid();
  final _picker = ImagePicker();
  final _locationsService = NigeriaLocationsService();

  int _step = 0;
  bool _movingForward = true;
  bool _submitting = false;
  bool _leavingFlow = false;
  bool _isLoadingStates = true;
  bool _isFetchingLocation = false;
  bool _didAttemptAutoLocation = false;
  String? _initialPayloadSignature;
  List<CorrectionIssue> _correctionIssues = const [];
  String? _statesLoadError;
  LatLng? _selectedLocation;

  final _name = TextEditingController();
  final _localName = TextEditingController();
  final _type = TextEditingController();
  final _state = TextEditingController();
  final _lga = TextEditingController();
  final _ward = TextEditingController();
  final _community = TextEditingController();
  final _landmark = TextEditingController();
  final _operator = TextEditingController();
  final _phone = TextEditingController();
  final _lat = TextEditingController(text: '9.0820');
  final _lng = TextEditingController(text: '8.6753');
  final _totalChildren = TextEditingController(text: '0');
  final _residentChildren = TextEditingController(text: '0');
  final _nonResidentChildren = TextEditingController(text: '0');
  final _boys = TextEditingController(text: '0');
  final _girls = TextEditingController(text: '0');
  final _age0to5 = TextEditingController(text: '0');
  final _age6to9 = TextEditingController(text: '0');
  final _age10to14 = TextEditingController(text: '0');
  final _age15plus = TextEditingController(text: '0');
  final _populationNotes = TextEditingController();
  final _feeding = TextEditingController();
  final _shelter = TextEditingController();
  final _sanitation = TextEditingController(text: 'false');
  final _water = TextEditingController();
  final _health = TextEditingController(text: 'false');
  final _clothing = TextEditingController(text: 'false');
  final _hygiene = TextEditingController();
  final _safetyRisks = TextEditingController();
  final _urgencyReason = TextEditingController();
  final _welfareNotes = TextEditingController();

  bool _immediateIntervention = false;
  UrgencyLevel _urgency = UrgencyLevel.low;
  final Set<NeedType> _needs = {};
  final Set<String> _studentAgeGroups = {};
  final List<SitePhotoDraft> _photos = [];
  final List<OperatorContactFields> _additionalOperators = [];
  List<NigeriaStateOption> _nigeriaStates = [];

  @override
  void initState() {
    super.initState();
    _step = widget.initialStep.clamp(0, _flowSteps.length - 1);
    _loadNigeriaStates();
    if (widget.siteId != null) {
      Future<void>.microtask(_loadSiteForEdit);
    } else if (widget.draftId != null) {
      Future<void>.microtask(_loadDraft);
    } else {
      Future<void>.microtask(_captureInitialPayloadSignature);
    }
  }

  @override
  void dispose() {
    for (final controller in [
      _name,
      _localName,
      _type,
      _state,
      _lga,
      _ward,
      _community,
      _landmark,
      _operator,
      _phone,
      _lat,
      _lng,
      _totalChildren,
      _residentChildren,
      _nonResidentChildren,
      _boys,
      _girls,
      _age0to5,
      _age6to9,
      _age10to14,
      _age15plus,
      _populationNotes,
      _feeding,
      _shelter,
      _sanitation,
      _water,
      _health,
      _clothing,
      _hygiene,
      _safetyRisks,
      _urgencyReason,
      _welfareNotes,
      ..._additionalOperators.expand((entry) => [entry.name, entry.phone]),
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.siteId != null;
    final title = widget.correctionOnly
        ? 'Correct School'
        : isEdit
        ? 'Edit School'
        : 'Add School';
    final isLast = _step == _flowSteps.length - 1;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop || _leavingFlow) return;
        _handleDeviceBack();
      },
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: AppColors.elevatedSurface(context),
          foregroundColor: AppColors.isDark(context)
              ? AppColors.onboardingGreen
              : AppColors.deepGreen,
          surfaceTintColor: AppColors.elevatedSurface(context),
          elevation: 0,
          shadowColor: AppColors.border(context),
          centerTitle: true,
          leadingWidth: 64,
          leading: Padding(
            padding: const EdgeInsets.only(left: 12),
            child: IconButton.filled(
              tooltip: 'Back to home',
              onPressed: _submitting || _leavingFlow ? null : _handleHeaderBack,
              icon: const Icon(Icons.arrow_back_rounded),
              style: IconButton.styleFrom(
                backgroundColor: AppColors.greenTint(context),
                disabledBackgroundColor: AppColors.border(context),
                disabledForegroundColor: AppColors.secondaryText(context),
                fixedSize: const Size.square(44),
                foregroundColor: AppColors.isDark(context)
                    ? AppColors.onboardingGreen
                    : AppColors.deepGreen,
                shape: const CircleBorder(),
              ),
            ),
          ),
          title: Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: AppColors.isDark(context)
                  ? AppColors.onboardingGreen
                  : AppColors.deepGreen,
              fontWeight: FontWeight.w800,
            ),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: IconButton.filled(
                tooltip: 'Save draft',
                onPressed: _submitting
                    ? null
                    : () => _saveDraft(syncPending: false),
                icon: const Icon(Icons.save_outlined),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.greenTint(context),
                  disabledBackgroundColor: AppColors.border(context),
                  disabledForegroundColor: AppColors.secondaryText(context),
                  fixedSize: const Size.square(44),
                  foregroundColor: AppColors.isDark(context)
                      ? AppColors.onboardingGreen
                      : AppColors.deepGreen,
                  shape: const CircleBorder(),
                ),
              ),
            ),
          ],
        ),
        body: SafeArea(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: AppColors.isDark(context)
                    ? const [
                        Color(0xFF10241F),
                        Color(0xFF0F1412),
                        Color(0xFF0F1412),
                      ]
                    : [
                        AppColors.paleGreen.withValues(alpha: 0.55),
                        Colors.white,
                        AppColors.scaffold,
                      ],
              ),
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: Responsive.pageMaxWidth(context),
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 18, 16, 12),
                        child: AddSiteFlowTimeline(
                          currentStep: _step,
                          steps: _flowSteps,
                        ),
                      ),
                      Expanded(
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 260),
                          transitionBuilder: (child, animation) {
                            final offsetTween = Tween<Offset>(
                              begin: Offset(_movingForward ? 0.14 : -0.14, 0),
                              end: Offset.zero,
                            );
                            return FadeTransition(
                              opacity: animation,
                              child: SlideTransition(
                                position: animation
                                    .drive(
                                      CurveTween(curve: Curves.easeOutCubic),
                                    )
                                    .drive(offsetTween),
                                child: child,
                              ),
                            );
                          },
                          child: SingleChildScrollView(
                            key: ValueKey(_step),
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                AddSiteStepHeader(
                                  stepNumber: _step + 1,
                                  totalSteps: _flowSteps.length,
                                  title: _flowSteps[_step].title,
                                  subtitle: _flowSteps[_step].subtitle,
                                ),
                                if (_correctionMessagesForStep.isNotEmpty) ...[
                                  const SizedBox(height: 14),
                                  _CorrectionStepBanner(
                                    messages: _correctionMessagesForStep,
                                  ),
                                ],
                                const SizedBox(height: 14),
                                AddSiteStepCard(
                                  child: AbsorbPointer(
                                    absorbing: !_isCurrentStepEditable,
                                    child: Opacity(
                                      opacity: _isCurrentStepEditable
                                          ? 1
                                          : 0.72,
                                      child: _buildCurrentStep(),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: AddSiteResponsiveActions(
                          secondary: _step > 0
                              ? OutlinedButton.icon(
                                  onPressed: _submitting ? null : _goBack,
                                  icon: const Icon(Icons.arrow_back_rounded),
                                  label: const Text('Back'),
                                )
                              : null,
                          primary: ElevatedButton.icon(
                            onPressed: _submitting
                                ? null
                                : (isLast ? _confirmSubmit : _continue),
                            icon: _submitting
                                ? const SizedBox.square(
                                    dimension: 18,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Icon(
                                    isLast
                                        ? Icons.cloud_upload_rounded
                                        : Icons.arrow_forward_rounded,
                                  ),
                            label: Text(isLast ? 'Submit' : 'Continue'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_step) {
      case 0:
        return SchoolDetailsStep(
          schoolTypes: _schoolTypes,
          nameController: _name,
          typeController: _type,
          primaryOperatorNameController: _operator,
          primaryOperatorPhoneController: _phone,
          additionalOperators: _additionalOperators,
          onAddOperator: _addOperator,
          onRemoveOperator: _removeOperator,
        );
      case 1:
        _triggerAutoLocationIfNeeded();
        return LocationStep(
          states: _nigeriaStates,
          availableLgas: _availableLgas,
          selectedState: _selectedStateValue,
          selectedLga: _selectedLgaValue,
          isLoadingStates: _isLoadingStates,
          statesLoadError: _statesLoadError,
          isFetchingLocation: _isFetchingLocation,
          currentLocation: _selectedLocation,
          onRetryLoadStates: _loadNigeriaStates,
          onStateChanged: _onStateChanged,
          onLgaChanged: _onLgaChanged,
          onMapTap: _onMapTap,
          wardController: _ward,
          communityController: _community,
          landmarkController: _landmark,
          latitudeController: _lat,
          longitudeController: _lng,
          onCaptureGps: _captureGps,
        );
      case 2:
        return PhotosReviewStep(
          photos: _photos,
          minPhotos: _minPhotos,
          maxPhotos: _maxPhotos,
          onCapturePhoto: () => _pickPhoto(ImageSource.camera),
          onSelectFromGallery: () => _pickPhoto(ImageSource.gallery),
          onPhotoCategoryChanged: _setPhotoCategory,
          onRemovePhoto: (photo) => setState(() => _photos.remove(photo)),
        );
      case 3:
        return PopulationStep(
          totalChildrenController: _totalChildren,
          residentChildrenController: _residentChildren,
          nonResidentChildrenController: _nonResidentChildren,
          boysController: _boys,
          girlsController: _girls,
          selectedAgeGroups: _studentAgeGroups,
          onAgeGroupToggled: (ageGroup, selected) => setState(() {
            if (selected) {
              _studentAgeGroups.add(ageGroup);
            } else {
              _studentAgeGroups.remove(ageGroup);
            }
          }),
          populationNotesController: _populationNotes,
        );
      case 4:
        return WelfareStep(
          feedingController: _feeding,
          shelterController: _shelter,
          sanitationController: _sanitation,
          waterController: _water,
          healthController: _health,
          clothingController: _clothing,
          hygieneController: _hygiene,
          welfareNotesController: _welfareNotes,
        );
      case 5:
        return NeedsPrioritiesStep(
          needs: _needs,
          urgency: _urgency,
          onNeedToggled: (need, selected) => setState(() {
            if (selected) {
              _needs.add(need);
            } else {
              _needs.remove(need);
            }
          }),
          onUrgencyChanged: (value) => setState(() => _urgency = value),
        );
      case 6:
        return ReviewStep(
          data: AddSiteReviewData(
            name: _name.text,
            type: _type.text,
            operatorName: _operator.text,
            phone: _phone.text,
            additionalOperators: _additionalOperators
                .map((entry) {
                  final name = entry.name.text.trim();
                  final phone = entry.phone.text.trim();
                  if (name.isEmpty && phone.isEmpty) return '';
                  if (name.isEmpty) return phone;
                  if (phone.isEmpty) return name;
                  return '$name - $phone';
                })
                .where((entry) => entry.isNotEmpty)
                .toList(),
            state: _state.text,
            lga: _lga.text,
            ward: _ward.text,
            community: _community.text,
            landmark: _landmark.text,
            latitude: _lat.text,
            longitude: _lng.text,
            totalChildren: _totalChildren.text,
            residentChildren: _residentChildren.text,
            nonResidentChildren: _nonResidentChildren.text,
            boys: _boys.text,
            girls: _girls.text,
            ageGroups: _studentAgeGroups.toList(),
            populationNotes: _populationNotes.text,
            mealsPerDay: _feeding.text,
            waterSource: _water.text,
            toiletAccess: _boolLabel(_sanitation),
            adequateClothing: _boolLabel(_clothing),
            healthcareAccess: _boolLabel(_health),
            sleepingArrangement: _shelter.text,
            hygieneCondition: _hygiene.text,
            welfareNotes: _welfareNotes.text,
            needs: _needs.toList(),
            urgency: _urgency,
          ),
          photos: _photos,
          submitting: _submitting,
          onEditStep: _goToStep,
          onSyncLater: _saveForSyncLater,
        );
      default:
        return const SizedBox.shrink();
    }
  }

  Future<void> _loadSiteForEdit() async {
    final site = await ref
        .read(sitesRepositoryProvider)
        .getSite(widget.siteId!);
    if (!mounted) return;

    final population = site.populationSummary;
    final welfare = site.welfareAssessment;

    setState(() {
      _name.text = site.name;
      _localName.text = site.localName ?? '';
      _type.text = _normalizeSchoolType(site.type);
      _state.text = site.state;
      _lga.text = site.lga;
      _ward.text = site.ward;
      _community.text = site.community;
      _landmark.text = site.landmark ?? '';
      _operator.text = site.operatorName;
      _phone.text = site.phone;
      _lat.text = site.latitude.toStringAsFixed(6);
      _lng.text = site.longitude.toStringAsFixed(6);
      _selectedLocation = LatLng(site.latitude, site.longitude);
      _urgency = site.urgencyLevel;
      _needs
        ..clear()
        ..addAll(site.needs);
      _correctionIssues = widget.correctionOnly
          ? site.correctionIssues
          : const [];
      if (widget.correctionOnly && site.correctionIssues.isNotEmpty) {
        _step = site.correctionIssues
            .map((issue) => issue.stepIndex)
            .reduce((value, element) => value < element ? value : element)
            .clamp(0, _flowSteps.length - 1);
      }

      if (population != null) {
        _totalChildren.text = '${population.totalChildren}';
        _residentChildren.text = '${population.residentChildren}';
        _nonResidentChildren.text = '${population.nonResidentChildren}';
        _boys.text = '${population.boys}';
        _girls.text = '${population.girls}';
        _age0to5.text = '${population.age0to5}';
        _age6to9.text = '${population.age6to9}';
        _age10to14.text = '${population.age10to14}';
        _age15plus.text = '${population.age15plus}';
        _studentAgeGroups
          ..clear()
          ..addAll(population.ageGroups);
        _populationNotes.text = population.notes ?? '';
      }

      if (welfare != null) {
        _feeding.text =
            welfare.mealsPerDay?.toString() ??
            _extractMealsPerDay(welfare.feedingStatus);
        _shelter.text = welfare.sleepingArrangement ?? welfare.shelterStatus;
        _sanitation.text =
            welfare.hasToiletAccess?.toString() ??
            _statusToBoolText(welfare.sanitationStatus);
        _water.text = welfare.waterSource ?? welfare.waterAccess;
        _health.text =
            welfare.hasHealthcareAccess?.toString() ??
            _statusToBoolText(welfare.healthAccess);
        _clothing.text =
            welfare.hasAdequateClothing?.toString() ??
            _statusToBoolText(welfare.clothingStatus);
        _hygiene.text = welfare.hygieneCondition ?? '';
        _safetyRisks.text = welfare.safetyRisks ?? '';
        _urgencyReason.text = welfare.urgencyReason ?? '';
        _welfareNotes.text = welfare.notes ?? '';
        _immediateIntervention = welfare.immediateInterventionNeeded;
      }

      _photos
        ..clear()
        ..addAll(
          site.media
              .where((file) => file.localPath != null)
              .map(
                (file) => SitePhotoDraft(
                  file: XFile(file.localPath!),
                  category: file.type,
                ),
              ),
        );
    });
    _captureInitialPayloadSignature();
  }

  Future<void> _loadDraft() async {
    final drafts = await ref.read(localDraftStorageProvider).all();
    SiteDraft? draft;
    for (final item in drafts) {
      if (item.id == widget.draftId) {
        draft = item;
        break;
      }
    }
    final selectedDraft = draft;
    if (selectedDraft == null || !mounted) {
      _captureInitialPayloadSignature();
      return;
    }

    setState(() {
      _step = selectedDraft.currentStep.clamp(0, _flowSteps.length - 1);
      _applyPayload(selectedDraft.payload);
    });
    _captureInitialPayloadSignature();
  }

  void _applyPayload(Map<String, dynamic> payload) {
    _name.text = payload['name'] as String? ?? '';
    _localName.text = payload['localName'] as String? ?? '';
    _type.text = payload['type'] as String? ?? '';
    _state.text = payload['state'] as String? ?? '';
    _lga.text = payload['lga'] as String? ?? '';
    _ward.text = payload['ward'] as String? ?? '';
    _community.text = payload['community'] as String? ?? '';
    _landmark.text = payload['landmark'] as String? ?? '';
    _operator.text = payload['operatorName'] as String? ?? '';
    _phone.text = payload['phone'] as String? ?? '';
    _lat.text = '${payload['latitude'] ?? '9.0820'}';
    _lng.text = '${payload['longitude'] ?? '8.6753'}';
    _selectedLocation = LatLng(
      double.tryParse(_lat.text) ?? 9.082,
      double.tryParse(_lng.text) ?? 8.6753,
    );
    _urgency = UrgencyLevel.fromJson(
      payload['urgencyLevel'] as String? ?? 'low',
    );
    _needs
      ..clear()
      ..addAll(
        (payload['needs'] as List? ?? const []).map(
          (item) => NeedType.fromJson(item as String),
        ),
      );

    final population = Map<String, dynamic>.from(
      payload['populationSummary'] as Map? ?? const {},
    );
    _totalChildren.text = '${population['totalChildren'] ?? 0}';
    _residentChildren.text = '${population['residentChildren'] ?? 0}';
    _nonResidentChildren.text = '${population['nonResidentChildren'] ?? 0}';
    _boys.text = '${population['boys'] ?? 0}';
    _girls.text = '${population['girls'] ?? 0}';
    _age0to5.text = '${population['age0to5'] ?? 0}';
    _age6to9.text = '${population['age6to9'] ?? 0}';
    _age10to14.text = '${population['age10to14'] ?? 0}';
    _age15plus.text = '${population['age15plus'] ?? 0}';
    _populationNotes.text = population['notes'] as String? ?? '';
    _studentAgeGroups
      ..clear()
      ..addAll(
        (population['ageGroups'] as List? ?? const []).map((item) => '$item'),
      );

    final welfare = Map<String, dynamic>.from(
      payload['welfareAssessment'] as Map? ?? const {},
    );
    _feeding.text = welfare['mealsPerDay']?.toString() ?? '';
    _shelter.text = welfare['sleepingArrangement'] as String? ?? '';
    _sanitation.text = '${welfare['hasToiletAccess'] ?? false}';
    _water.text = welfare['waterSource'] as String? ?? '';
    _health.text = '${welfare['hasHealthcareAccess'] ?? false}';
    _clothing.text = '${welfare['hasAdequateClothing'] ?? false}';
    _hygiene.text = welfare['hygieneCondition'] as String? ?? '';
    _safetyRisks.text = welfare['safetyRisks'] as String? ?? '';
    _urgencyReason.text = welfare['urgencyReason'] as String? ?? '';
    _welfareNotes.text = welfare['notes'] as String? ?? '';
    _immediateIntervention =
        welfare['immediateInterventionNeeded'] as bool? ?? false;

    _photos
      ..clear()
      ..addAll(
        (payload['media'] as List? ?? const [])
            .map((item) => Map<String, dynamic>.from(item as Map))
            .where((item) => (item['localPath'] as String?)?.isNotEmpty == true)
            .map(
              (item) => SitePhotoDraft(
                file: XFile(item['localPath'] as String),
                category: MediaType.fromJson(
                  item['type'] as String? ?? 'other',
                ),
              ),
            ),
      );
  }

  String _normalizeSchoolType(String rawType) {
    if (_schoolTypes.contains(rawType)) {
      return rawType;
    }
    if (rawType.toLowerCase() == 'informal learning centre') {
      return 'Informal Islamic School';
    }
    return '';
  }

  String _extractMealsPerDay(String value) {
    final match = RegExp(r'\b[0-3]\b').firstMatch(value);
    return match?.group(0) ?? '';
  }

  String _statusToBoolText(String value) {
    final normalized = value.toLowerCase();
    if (normalized == 'true' ||
        normalized.contains('available') ||
        normalized.contains('adequate') ||
        normalized.contains('yes') ||
        normalized.contains('functional')) {
      return 'true';
    }
    return 'false';
  }

  void _continue() {
    if (!_formKey.currentState!.validate()) return;
    if (_step == 2 && !_shouldSkipPhotoValidation && !_validatePhotos()) return;
    setState(() {
      _movingForward = true;
      _step += 1;
    });
    if (_step == 1) {
      _triggerAutoLocationIfNeeded();
    }
  }

  void _goBack() {
    setState(() {
      _movingForward = false;
      _step -= 1;
    });
  }

  void _goToStep(int step) {
    setState(() {
      _movingForward = step > _step;
      _step = step.clamp(0, _flowSteps.length - 1);
    });
  }

  void _handleDeviceBack() {
    if (_step > 0) {
      _goBack();
      return;
    }
    _attemptLeaveFlow();
  }

  void _handleHeaderBack() {
    if (_step > 0) {
      _goBack();
      return;
    }
    _attemptLeaveFlow();
  }

  Future<void> _attemptLeaveFlow() async {
    if (_leavingFlow) return;
    if (!_hasUnsavedChanges) {
      _discardAndGoHome();
      return;
    }

    final action = await showDialog<_LeaveAction>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Save this record?'),
        content: const Text(
          'You have changes in this school record. Save them as a draft or discard them before leaving.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(_LeaveAction.cancel),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(_LeaveAction.discard),
            child: const Text('Discard'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(_LeaveAction.saveDraft),
            child: const Text('Save as Draft'),
          ),
        ],
      ),
    );

    if (!mounted || action == null || action == _LeaveAction.cancel) return;
    if (action == _LeaveAction.saveDraft) {
      await _saveDraftAndGoHome();
      return;
    }
    _discardAndGoHome();
  }

  Future<void> _saveDraftAndGoHome() async {
    if (_leavingFlow) return;
    setState(() => _leavingFlow = true);
    await _saveDraft(syncPending: false);
    if (!mounted) return;
    await Future<void>.delayed(const Duration(milliseconds: 650));
    if (!mounted) return;
    context.go(_homePath);
  }

  void _discardAndGoHome() {
    if (_leavingFlow) return;
    setState(() => _leavingFlow = true);
    context.go(_homePath);
  }

  void _addOperator() {
    setState(() => _additionalOperators.add(OperatorContactFields()));
  }

  void _removeOperator(int index) {
    setState(() {
      final entry = _additionalOperators.removeAt(index);
      entry.dispose();
    });
  }

  Future<void> _captureGps({bool silent = false}) async {
    if (mounted) {
      setState(() => _isFetchingLocation = true);
    }
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      if (mounted && !silent) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Location permission is required to capture GPS.'),
          ),
        );
      }
      if (mounted) {
        setState(() => _isFetchingLocation = false);
      }
      return;
    }
    try {
      final position = await Geolocator.getCurrentPosition();
      if (!mounted) return;
      setState(() {
        _selectedLocation = LatLng(position.latitude, position.longitude);
        _lat.text = position.latitude.toStringAsFixed(6);
        _lng.text = position.longitude.toStringAsFixed(6);
      });
    } finally {
      if (mounted) {
        setState(() => _isFetchingLocation = false);
      }
    }
  }

  void _onMapTap(LatLng location) {
    setState(() {
      _selectedLocation = location;
      _lat.text = location.latitude.toStringAsFixed(6);
      _lng.text = location.longitude.toStringAsFixed(6);
    });
  }

  void _onStateChanged(String? value) {
    setState(() {
      _state.text = value ?? '';
      _lga.clear();
    });
  }

  void _onLgaChanged(String? value) {
    setState(() {
      _lga.text = value ?? '';
    });
  }

  List<String> get _availableLgas {
    final selectedState = _selectedStateValue;
    if (selectedState == null) {
      return const [];
    }
    final matches = _nigeriaStates.where((item) => item.name == selectedState);
    if (matches.isEmpty) {
      return const [];
    }
    return matches.first.lgas;
  }

  String? get _selectedStateValue {
    final value = _state.text.trim();
    return value.isEmpty ? null : value;
  }

  String? get _selectedLgaValue {
    final value = _lga.text.trim();
    return value.isEmpty ? null : value;
  }

  Future<void> _loadNigeriaStates() async {
    setState(() {
      _isLoadingStates = true;
      _statesLoadError = null;
    });
    try {
      final states = await _locationsService.fetchStatesAndLgas();
      if (!mounted) return;
      setState(() {
        _nigeriaStates = states;
        _isLoadingStates = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isLoadingStates = false;
        _statesLoadError =
            'Could not load Nigerian states and LGAs. Check internet and try again.';
      });
    }
  }

  void _triggerAutoLocationIfNeeded() {
    if (_didAttemptAutoLocation) return;
    _didAttemptAutoLocation = true;
    Future<void>.microtask(() => _captureGps(silent: true));
  }

  Future<void> _pickPhoto(ImageSource source) async {
    final remainingSlots = _maxPhotos - _photos.length;
    if (remainingSlots <= 0) {
      _showPhotoLimitMessage();
      return;
    }

    if (source == ImageSource.gallery) {
      final selectedPhotos = await _picker.pickMultiImage(
        imageQuality: 82,
        maxWidth: 1600,
        limit: remainingSlots,
      );
      if (selectedPhotos.isEmpty) return;

      final acceptedPhotos = selectedPhotos
          .take(remainingSlots)
          .map((photo) => SitePhotoDraft(file: photo));
      setState(() => _photos.addAll(acceptedPhotos));

      if (selectedPhotos.length > remainingSlots) {
        _showPhotoLimitMessage();
      }
      return;
    }

    final photo = await _picker.pickImage(
      source: source,
      imageQuality: 82,
      maxWidth: 1600,
    );
    if (photo == null) return;
    setState(() => _photos.add(SitePhotoDraft(file: photo)));
  }

  void _setPhotoCategory(SitePhotoDraft photo, MediaType? category) {
    if (category == null) return;
    final index = _photos.indexOf(photo);
    if (index == -1) return;
    setState(() {
      _photos[index] = photo.copyWith(category: category);
    });
  }

  bool _validatePhotos() {
    if (_photos.length < _minPhotos) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Add at least 2 school environment photos.'),
        ),
      );
      return false;
    }
    if (_photos.length > _maxPhotos) {
      _showPhotoLimitMessage();
      return false;
    }
    if (_photos.any((photo) => photo.category == null)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Assign a category to each photo.')),
      );
      return false;
    }
    return true;
  }

  void _showPhotoLimitMessage() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('You can upload a maximum of 8 photos.')),
    );
  }

  Future<void> _saveDraft({
    required bool syncPending,
    bool showMessage = true,
  }) async {
    final draft = SiteDraft(
      id: widget.draftId ?? widget.siteId ?? _uuid.v4(),
      updatedAt: DateTime.now(),
      payload: _payload(),
      syncPending: syncPending,
      currentStep: _step,
      totalSteps: _flowSteps.length,
    );
    await ref.read(localDraftStorageProvider).save(draft);
    ref.invalidate(draftsProvider);
    if (!mounted) return;

    if (showMessage) {
      _showDraftSavedMessage(syncPending: syncPending);
    }

    if (syncPending) context.go('/sync');
  }

  Future<void> _saveForSyncLater() async {
    if (!_shouldSkipPhotoValidation && !_validatePhotos()) return;
    await _saveDraft(syncPending: true);
  }

  void _showDraftSavedMessage({required bool syncPending}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.deepGreen,
          elevation: 8,
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_rounded,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  syncPending
                      ? 'Record saved for later sync'
                      : 'Record saved in draft',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
  }

  Future<void> _confirmSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_shouldSkipPhotoValidation && !_validatePhotos()) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit site record?'),
        content: const Text(
          'This will upload aggregate site and welfare data for admin verification.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Submit'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    await _submit();
  }

  String get _homePath {
    final session = ref.read(authControllerProvider).valueOrNull?.session;
    return session?.accessRole.dashboardPath ?? '/home';
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final repository = ref.read(sitesRepositoryProvider);
      final site = widget.siteId == null
          ? await repository.createSite(_payload())
          : await repository.updateSite(widget.siteId!, _payload());
      ref
        ..invalidate(sitesProvider)
        ..invalidate(dashboardSummaryProvider);
      final session = ref.read(authControllerProvider).valueOrNull?.session;
      if (session != null) {
        ref.invalidate(submittedSitesProvider(session.user.id));
      }
      if (widget.draftId != null) {
        await ref.read(localDraftStorageProvider).delete(widget.draftId!);
        ref.invalidate(draftsProvider);
      }
      if (!mounted) return;

      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Record submitted'),
          content: Text('${site.name} is ready for admin review.'),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('View site'),
            ),
          ],
        ),
      );

      if (mounted) context.go('/sites/${site.id}');
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Map<String, dynamic> _payload() {
    final session = ref.read(authControllerProvider).valueOrNull?.session;
    final mealsPerDay = int.tryParse(_feeding.text.trim());
    final hasToiletAccess = _parseBoolController(_sanitation);
    final hasAdequateClothing = _parseBoolController(_clothing);
    final hasHealthcareAccess = _parseBoolController(_health);
    return {
      'name': _name.text.trim(),
      'localName': _localName.text.trim().isEmpty
          ? null
          : _localName.text.trim(),
      'type': _type.text.trim(),
      'operatorName': _operator.text.trim(),
      'phone': _phone.text.trim(),
      'operatorContacts':
          [
            {'name': _operator.text.trim(), 'phone': _phone.text.trim()},
            ..._additionalOperators.map(
              (entry) => {
                'name': entry.name.text.trim(),
                'phone': entry.phone.text.trim(),
              },
            ),
          ].where((entry) {
            final name = entry['name'] ?? '';
            final phone = entry['phone'] ?? '';
            return name.isNotEmpty || phone.isNotEmpty;
          }).toList(),
      'country': 'Nigeria',
      'state': _state.text.trim(),
      'lga': _lga.text.trim(),
      'ward': _ward.text.trim(),
      'community': _community.text.trim(),
      'landmark': _landmark.text.trim().isEmpty ? null : _landmark.text.trim(),
      'latitude': double.tryParse(_lat.text) ?? 9.082,
      'longitude': double.tryParse(_lng.text) ?? 8.6753,
      'urgencyLevel': _urgency.name,
      'createdBy': session?.user.id ?? 'field-001',
      'populationSummary': {
        'totalChildren': int.tryParse(_totalChildren.text) ?? 0,
        'residentChildren': int.tryParse(_residentChildren.text) ?? 0,
        'nonResidentChildren': int.tryParse(_nonResidentChildren.text) ?? 0,
        'boys': int.tryParse(_boys.text) ?? 0,
        'girls': int.tryParse(_girls.text) ?? 0,
        'ageGroups': _studentAgeGroups.toList(),
        'age0to5': int.tryParse(_age0to5.text) ?? 0,
        'age6to9': int.tryParse(_age6to9.text) ?? 0,
        'age10to14': int.tryParse(_age10to14.text) ?? 0,
        'age15plus': int.tryParse(_age15plus.text) ?? 0,
        'notes': _populationNotes.text.trim(),
      },
      'welfareAssessment': {
        'feedingStatus': mealsPerDay == null
            ? _feeding.text.trim()
            : '$mealsPerDay meals per day',
        'shelterStatus': _shelter.text.trim(),
        'sanitationStatus': hasToiletAccess
            ? 'Functional toilet/latrine available'
            : 'No functional toilet/latrine available',
        'waterAccess': _water.text.trim(),
        'healthAccess': hasHealthcareAccess
            ? 'Healthcare access available'
            : 'No healthcare access',
        'clothingStatus': hasAdequateClothing
            ? 'Adequate clothing'
            : 'Inadequate clothing',
        'mealsPerDay': mealsPerDay,
        'waterSource': _water.text.trim(),
        'hasToiletAccess': hasToiletAccess,
        'hasAdequateClothing': hasAdequateClothing,
        'hasHealthcareAccess': hasHealthcareAccess,
        'sleepingArrangement': _shelter.text.trim(),
        'hygieneCondition': _hygiene.text.trim(),
        'safetyRisks': _safetyRisks.text.trim(),
        'immediateInterventionNeeded': _immediateIntervention,
        'urgencyReason': _urgencyReason.text.trim(),
        'notes': _welfareNotes.text.trim(),
      },
      'needs': _needs.map((need) => need.toJson()).toList(),
      'media': _photos
          .map(
            (photo) => MediaFile(
              id: _uuid.v4(),
              siteId: widget.siteId ?? 'pending',
              localPath: photo.file.path,
              type: photo.category ?? MediaType.other,
              timestamp: DateTime.now(),
              latitude: double.tryParse(_lat.text),
              longitude: double.tryParse(_lng.text),
              uploadedBy: session?.user.id ?? 'field-001',
            ).toJson(),
          )
          .toList(),
    };
  }

  bool _parseBoolController(TextEditingController controller) {
    return controller.text.trim().toLowerCase() == 'true';
  }

  String _boolLabel(TextEditingController controller) {
    return _parseBoolController(controller) ? 'Yes' : 'No';
  }

  bool get _hasUnsavedChanges {
    final initial = _initialPayloadSignature;
    if (initial == null) return false;
    return initial != _payloadSignature();
  }

  List<String> get _correctionMessagesForStep {
    return _correctionIssues
        .where((issue) => issue.stepIndex == _step)
        .map((issue) => issue.message)
        .toList();
  }

  bool get _isCurrentStepEditable {
    if (!widget.correctionOnly || _correctionIssues.isEmpty) return true;
    return _correctionIssues.any((issue) => issue.stepIndex == _step);
  }

  bool get _shouldSkipPhotoValidation {
    return widget.correctionOnly &&
        !_correctionIssues.any((issue) => issue.stepIndex == 2);
  }

  void _captureInitialPayloadSignature() {
    if (!mounted) return;
    _initialPayloadSignature = _payloadSignature();
  }

  String _payloadSignature() {
    return jsonEncode(_normalizedPayload(_payload()));
  }

  Map<String, dynamic> _normalizedPayload(Map<String, dynamic> payload) {
    final normalized = Map<String, dynamic>.from(payload);
    normalized['media'] = (payload['media'] as List? ?? const []).map((item) {
      final media = Map<String, dynamic>.from(item as Map);
      media.remove('id');
      media.remove('timestamp');
      media.remove('siteId');
      return media;
    }).toList();
    return normalized;
  }
}

enum _LeaveAction { cancel, saveDraft, discard }

class _CorrectionStepBanner extends StatelessWidget {
  const _CorrectionStepBanner({required this.messages});

  final List<String> messages;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.dangerTint(context),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.35)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.report_problem_outlined, color: AppColors.danger),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Admin correction needed',
                  style: TextStyle(
                    color: AppColors.danger,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          for (final message in messages)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                message,
                style: const TextStyle(
                  color: AppColors.danger,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
