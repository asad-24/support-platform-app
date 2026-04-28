import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
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

class AddSiteFlowScreen extends ConsumerStatefulWidget {
  const AddSiteFlowScreen({super.key, this.siteId, this.initialStep = 0});

  final String? siteId;
  final int initialStep;

  @override
  ConsumerState<AddSiteFlowScreen> createState() => _AddSiteFlowScreenState();
}

class _AddSiteFlowScreenState extends ConsumerState<AddSiteFlowScreen> {
  final _formKey = GlobalKey<FormState>();
  final _uuid = const Uuid();
  final _picker = ImagePicker();
  int _step = 0;
  bool _submitting = false;

  final _name = TextEditingController();
  final _localName = TextEditingController();
  final _type = TextEditingController(text: 'Informal learning centre');
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
  final _age0to5 = TextEditingController(text: '0');
  final _age6to9 = TextEditingController(text: '0');
  final _age10to14 = TextEditingController(text: '0');
  final _age15plus = TextEditingController(text: '0');
  final _populationNotes = TextEditingController();
  final _feeding = TextEditingController(text: 'Unknown');
  final _shelter = TextEditingController(text: 'Unknown');
  final _sanitation = TextEditingController(text: 'Unknown');
  final _water = TextEditingController(text: 'Unknown');
  final _health = TextEditingController(text: 'Unknown');
  final _clothing = TextEditingController(text: 'Unknown');
  final _safetyRisks = TextEditingController();
  final _urgencyReason = TextEditingController();
  final _welfareNotes = TextEditingController();
  bool _immediateIntervention = false;
  UrgencyLevel _urgency = UrgencyLevel.low;
  final Set<NeedType> _needs = {};
  final List<XFile> _photos = [];

  @override
  void initState() {
    super.initState();
    _step = widget.initialStep.clamp(0, 6);
    if (widget.siteId != null) {
      Future<void>.microtask(_loadSiteForEdit);
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
      _safetyRisks,
      _urgencyReason,
      _welfareNotes,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.siteId != null;
    return Scaffold(
      appBar: AppBar(
        title: Text(isEdit ? 'Edit site' : 'Register site'),
        actions: [
          TextButton.icon(
            onPressed: _submitting
                ? null
                : () => _saveDraft(syncPending: false),
            icon: const Icon(Icons.save_outlined, color: Colors.white),
            label: const Text('Draft', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: Responsive.pageMaxWidth(context),
            ),
            child: Form(
              key: _formKey,
              child: Stepper(
                type: MediaQuery.sizeOf(context).width > 800
                    ? StepperType.horizontal
                    : StepperType.vertical,
                currentStep: _step,
                onStepTapped: (step) => setState(() => _step = step),
                controlsBuilder: (context, details) {
                  final isLast = _step == 6;
                  return Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
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
                        const SizedBox(width: 10),
                        if (_step > 0)
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _submitting
                                  ? null
                                  : () => setState(() => _step -= 1),
                              icon: const Icon(Icons.arrow_back_rounded),
                              label: const Text('Back'),
                            ),
                          ),
                      ],
                    ),
                  );
                },
                steps: [
                  Step(
                    title: const Text('Identity'),
                    isActive: _step >= 0,
                    content: _StepCard(
                      children: [
                        _field(_name, 'Centre name', required: true),
                        _field(_localName, 'Local name'),
                        _field(_type, 'Type', required: true),
                        _field(_state, 'State', required: true),
                        _field(_lga, 'LGA', required: true),
                        _field(_ward, 'Ward', required: true),
                        _field(_community, 'Community', required: true),
                        _field(_landmark, 'Landmark'),
                      ],
                    ),
                  ),
                  Step(
                    title: const Text('GPS'),
                    isActive: _step >= 1,
                    content: _StepCard(
                      children: [
                        OutlinedButton.icon(
                          onPressed: _captureGps,
                          icon: const Icon(Icons.my_location_rounded),
                          label: const Text('Capture current GPS'),
                        ),
                        Row(
                          children: [
                            Expanded(
                              child: _field(
                                _lat,
                                'Latitude',
                                required: true,
                                keyboardType: TextInputType.number,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _field(
                                _lng,
                                'Longitude',
                                required: true,
                                keyboardType: TextInputType.number,
                              ),
                            ),
                          ],
                        ),
                        const Text(
                          'Manual adjustment is available for cases where the field worker is standing near, but not inside, the learning centre.',
                          style: TextStyle(
                            color: AppColors.muted,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Step(
                    title: const Text('Contact'),
                    isActive: _step >= 2,
                    content: _StepCard(
                      children: [
                        _field(
                          _operator,
                          'Operator/contact name',
                          required: true,
                        ),
                        _field(
                          _phone,
                          'Phone number',
                          keyboardType: TextInputType.phone,
                        ),
                      ],
                    ),
                  ),
                  Step(
                    title: const Text('Population'),
                    isActive: _step >= 3,
                    content: _StepCard(
                      children: [
                        _numberGrid(
                          [
                            _totalChildren,
                            _residentChildren,
                            _nonResidentChildren,
                            _age0to5,
                            _age6to9,
                            _age10to14,
                            _age15plus,
                          ],
                          const [
                            'Total children',
                            'Resident',
                            'Non-resident',
                            'Age 0-5',
                            'Age 6-9',
                            'Age 10-14',
                            'Age 15+',
                          ],
                        ),
                        _field(
                          _populationNotes,
                          'Population notes',
                          maxLines: 3,
                        ),
                      ],
                    ),
                  ),
                  Step(
                    title: const Text('Welfare'),
                    isActive: _step >= 4,
                    content: _StepCard(
                      children: [
                        _field(_feeding, 'Feeding status', required: true),
                        _field(_shelter, 'Shelter status', required: true),
                        _field(
                          _sanitation,
                          'Sanitation status',
                          required: true,
                        ),
                        _field(_water, 'Water access', required: true),
                        _field(_health, 'Health access', required: true),
                        _field(_clothing, 'Clothing status', required: true),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Immediate intervention needed'),
                          value: _immediateIntervention,
                          onChanged: (value) =>
                              setState(() => _immediateIntervention = value),
                        ),
                        DropdownButtonFormField<UrgencyLevel>(
                          key: ValueKey(_urgency),
                          initialValue: _urgency,
                          decoration: const InputDecoration(
                            labelText: 'Urgency level',
                          ),
                          items: UrgencyLevel.values
                              .map(
                                (level) => DropdownMenuItem(
                                  value: level,
                                  child: Text(level.label),
                                ),
                              )
                              .toList(),
                          onChanged: (value) => setState(
                            () => _urgency = value ?? UrgencyLevel.low,
                          ),
                        ),
                        _field(_urgencyReason, 'Urgency reason', maxLines: 3),
                        _field(
                          _safetyRisks,
                          'Safeguarding/safety risks for admin review',
                          maxLines: 3,
                        ),
                        _field(_welfareNotes, 'Welfare notes', maxLines: 3),
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            'Needs',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: NeedType.values.map((need) {
                            return FilterChip(
                              label: Text(need.label),
                              selected: _needs.contains(need),
                              onSelected: (selected) => setState(() {
                                if (selected) {
                                  _needs.add(need);
                                } else {
                                  _needs.remove(need);
                                }
                              }),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                  Step(
                    title: const Text('Photos'),
                    isActive: _step >= 5,
                    content: _StepCard(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () => _pickPhoto(ImageSource.camera),
                                icon: const Icon(Icons.camera_alt_rounded),
                                label: const Text('Camera'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () =>
                                    _pickPhoto(ImageSource.gallery),
                                icon: const Icon(Icons.photo_library_rounded),
                                label: const Text('Gallery'),
                              ),
                            ),
                          ],
                        ),
                        if (_photos.isEmpty)
                          const Text(
                            'No photos selected yet.',
                            style: TextStyle(color: AppColors.muted),
                          )
                        else
                          ..._photos.map(
                            (photo) => ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: const Icon(
                                Icons.image_rounded,
                                color: AppColors.deepGreen,
                              ),
                              title: Text(photo.name),
                              subtitle: const Text(
                                'Stored locally until upload/sync',
                              ),
                              trailing: IconButton(
                                tooltip: 'Remove photo',
                                onPressed: () =>
                                    setState(() => _photos.remove(photo)),
                                icon: const Icon(Icons.delete_outline_rounded),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Step(
                    title: const Text('Review'),
                    isActive: _step >= 6,
                    content: _StepCard(
                      children: [
                        _ReviewRow('Name', _name.text),
                        _ReviewRow(
                          'Location',
                          '${_community.text}, ${_lga.text}, ${_state.text}',
                        ),
                        _ReviewRow('GPS', '${_lat.text}, ${_lng.text}'),
                        _ReviewRow('Children', _totalChildren.text),
                        _ReviewRow('Urgency', _urgency.label),
                        _ReviewRow('Photos', '${_photos.length} selected'),
                        const Divider(),
                        OutlinedButton.icon(
                          onPressed: _submitting
                              ? null
                              : () => _saveDraft(syncPending: true),
                          icon: const Icon(Icons.sync_problem_rounded),
                          label: const Text('Sync later'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
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
      _type.text = site.type;
      _state.text = site.state;
      _lga.text = site.lga;
      _ward.text = site.ward;
      _community.text = site.community;
      _landmark.text = site.landmark ?? '';
      _operator.text = site.operatorName;
      _phone.text = site.phone;
      _lat.text = site.latitude.toStringAsFixed(6);
      _lng.text = site.longitude.toStringAsFixed(6);
      _urgency = site.urgencyLevel;
      _needs
        ..clear()
        ..addAll(site.needs);
      if (population != null) {
        _totalChildren.text = '${population.totalChildren}';
        _residentChildren.text = '${population.residentChildren}';
        _nonResidentChildren.text = '${population.nonResidentChildren}';
        _age0to5.text = '${population.age0to5}';
        _age6to9.text = '${population.age6to9}';
        _age10to14.text = '${population.age10to14}';
        _age15plus.text = '${population.age15plus}';
        _populationNotes.text = population.notes ?? '';
      }
      if (welfare != null) {
        _feeding.text = welfare.feedingStatus;
        _shelter.text = welfare.shelterStatus;
        _sanitation.text = welfare.sanitationStatus;
        _water.text = welfare.waterAccess;
        _health.text = welfare.healthAccess;
        _clothing.text = welfare.clothingStatus;
        _safetyRisks.text = welfare.safetyRisks ?? '';
        _urgencyReason.text = welfare.urgencyReason ?? '';
        _welfareNotes.text = welfare.notes ?? '';
        _immediateIntervention = welfare.immediateInterventionNeeded;
      }
    });
  }

  Widget _field(
    TextEditingController controller,
    String label, {
    bool required = false,
    int maxLines = 1,
    TextInputType? keyboardType,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        decoration: InputDecoration(labelText: label),
        validator: required
            ? (value) {
                if (value == null || value.trim().isEmpty) {
                  return '$label is required';
                }
                return null;
              }
            : null,
      ),
    );
  }

  Widget _numberGrid(
    List<TextEditingController> controllers,
    List<String> labels,
  ) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final twoColumns = constraints.maxWidth > 520;
        return Wrap(
          spacing: 10,
          runSpacing: 0,
          children: [
            for (var i = 0; i < controllers.length; i++)
              SizedBox(
                width: twoColumns
                    ? (constraints.maxWidth - 10) / 2
                    : constraints.maxWidth,
                child: _field(
                  controllers[i],
                  labels[i],
                  required: true,
                  keyboardType: TextInputType.number,
                ),
              ),
          ],
        );
      },
    );
  }

  void _continue() {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _step += 1);
  }

  Future<void> _captureGps() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location permission is required to capture GPS.'),
        ),
      );
      return;
    }
    final position = await Geolocator.getCurrentPosition();
    setState(() {
      _lat.text = position.latitude.toStringAsFixed(6);
      _lng.text = position.longitude.toStringAsFixed(6);
    });
  }

  Future<void> _pickPhoto(ImageSource source) async {
    final photo = await _picker.pickImage(
      source: source,
      imageQuality: 82,
      maxWidth: 1600,
    );
    if (photo != null) {
      setState(() => _photos.add(photo));
    }
  }

  Future<void> _saveDraft({required bool syncPending}) async {
    final draft = SiteDraft(
      id: widget.siteId ?? _uuid.v4(),
      updatedAt: DateTime.now(),
      payload: _payload(),
      syncPending: syncPending,
    );
    await ref.read(localDraftStorageProvider).save(draft);
    ref.invalidate(draftsProvider);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          syncPending ? 'Saved for later sync.' : 'Draft saved locally.',
        ),
      ),
    );
    if (syncPending) context.go('/sync');
  }

  Future<void> _confirmSubmit() async {
    if (!_formKey.currentState!.validate()) return;
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
    return {
      'name': _name.text.trim(),
      'localName': _localName.text.trim().isEmpty
          ? null
          : _localName.text.trim(),
      'type': _type.text.trim(),
      'operatorName': _operator.text.trim(),
      'phone': _phone.text.trim(),
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
        'age0to5': int.tryParse(_age0to5.text) ?? 0,
        'age6to9': int.tryParse(_age6to9.text) ?? 0,
        'age10to14': int.tryParse(_age10to14.text) ?? 0,
        'age15plus': int.tryParse(_age15plus.text) ?? 0,
        'notes': _populationNotes.text.trim(),
      },
      'welfareAssessment': {
        'feedingStatus': _feeding.text.trim(),
        'shelterStatus': _shelter.text.trim(),
        'sanitationStatus': _sanitation.text.trim(),
        'waterAccess': _water.text.trim(),
        'healthAccess': _health.text.trim(),
        'clothingStatus': _clothing.text.trim(),
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
              localPath: photo.path,
              type: MediaType.other,
              timestamp: DateTime.now(),
              latitude: double.tryParse(_lat.text),
              longitude: double.tryParse(_lng.text),
              uploadedBy: session?.user.id ?? 'field-001',
            ).toJson(),
          )
          .toList(),
    };
  }
}

class _StepCard extends StatelessWidget {
  const _StepCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: children,
        ),
      ),
    );
  }
}

class _ReviewRow extends StatelessWidget {
  const _ReviewRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.muted,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Expanded(child: Text(value.isEmpty ? 'Not provided' : value)),
        ],
      ),
    );
  }
}
