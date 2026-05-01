import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../auth/presentation/auth_controller.dart';
import '../../sites/presentation/add_site_flow/flow_timeline.dart';
import '../../sites/presentation/add_site_flow/form_fields.dart';
import '../../sites/presentation/add_site_flow/models.dart';
import '../../sites/presentation/add_site_flow/nigeria_locations_service.dart';
import '../../sites/presentation/add_site_flow/shared_widgets.dart';

class VolunteerProfileSetupScreen extends ConsumerStatefulWidget {
  const VolunteerProfileSetupScreen({super.key, this.editMode = false});

  final bool editMode;

  @override
  ConsumerState<VolunteerProfileSetupScreen> createState() =>
      _VolunteerProfileSetupScreenState();
}

class _VolunteerProfileSetupScreenState
    extends ConsumerState<VolunteerProfileSetupScreen> {
  static const _steps = [
    FlowStepMeta(title: 'Name', subtitle: 'Volunteer identity.'),
    FlowStepMeta(title: 'Phone', subtitle: 'Contact number.'),
    FlowStepMeta(title: 'Address', subtitle: 'Nigeria location and photo.'),
  ];

  final _formKey = GlobalKey<FormState>();
  final _locationsService = NigeriaLocationsService();
  final _picker = ImagePicker();
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _state = TextEditingController();
  final _lga = TextEditingController();
  final _address = TextEditingController();

  int _step = 0;
  bool _movingForward = true;
  bool _loadingLocations = true;
  String? _locationsError;
  XFile? _profileImage;
  List<NigeriaStateOption> _states = [];

  @override
  void initState() {
    super.initState();
    final user = ref.read(authControllerProvider).valueOrNull?.session?.user;
    if (user != null) {
      _name.text = user.name;
      _phone.text = user.phone ?? '';
      _state.text = user.state ?? '';
      _lga.text = user.lga ?? '';
      _address.text = user.address ?? '';
      final imagePath = user.profileImagePath;
      if (imagePath != null && imagePath.isNotEmpty) {
        _profileImage = XFile(imagePath);
      }
    }
    _loadLocations();
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _state.dispose();
    _lga.dispose();
    _address.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authControllerProvider, (previous, next) {
      next.whenOrNull(
        data: (state) {
          final complete = state.session?.user.profileComplete ?? false;
          if (complete && !widget.editMode) {
            context.go('/welcome/volunteer');
          } else if (complete && widget.editMode) {
            context.go('/volunteer/profile');
          }
        },
        error: (error, _) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(error.toString())));
        },
      );
    });

    final authState = ref.watch(authControllerProvider);
    final isLast = _step == _steps.length - 1;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.elevatedSurface(context),
        foregroundColor: AppColors.isDark(context)
            ? AppColors.onboardingGreen
            : AppColors.deepGreen,
        surfaceTintColor: AppColors.elevatedSurface(context),
        title: Text(widget.editMode ? 'Edit Profile' : 'Complete Profile'),
        leading: widget.editMode
            ? IconButton(
                tooltip: 'Back',
                onPressed: () => context.go('/volunteer/profile'),
                icon: const Icon(Icons.arrow_back_rounded),
              )
            : null,
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
                        steps: _steps,
                      ),
                    ),
                    Expanded(
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 240),
                        transitionBuilder: (child, animation) {
                          final tween = Tween<Offset>(
                            begin: Offset(_movingForward ? 0.12 : -0.12, 0),
                            end: Offset.zero,
                          );
                          return FadeTransition(
                            opacity: animation,
                            child: SlideTransition(
                              position: animation.drive(tween),
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
                                totalSteps: _steps.length,
                                title: _steps[_step].title,
                                subtitle: _steps[_step].subtitle,
                              ),
                              const SizedBox(height: 14),
                              AddSiteStepCard(child: _buildStep()),
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
                                onPressed: authState.isLoading ? null : _back,
                                icon: const Icon(Icons.arrow_back_rounded),
                                label: const Text('Back'),
                              )
                            : null,
                        primary: ElevatedButton.icon(
                          onPressed: authState.isLoading
                              ? null
                              : (isLast ? _submit : _continue),
                          icon: authState.isLoading
                              ? const SizedBox.square(
                                  dimension: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Icon(
                                  isLast
                                      ? Icons.check_rounded
                                      : Icons.arrow_forward_rounded,
                                ),
                          label: Text(isLast ? 'Finish' : 'Continue'),
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
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case 0:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AddSiteFormSectionHeader(
              title: 'Volunteer Name',
              description: 'Enter the name that will appear on your profile.',
            ),
            AddSiteLabeledTextField(
              controller: _name,
              heading: 'Volunteer name',
              hintText: 'Enter volunteer name',
              required: true,
              enabled: !widget.editMode,
              prefixIcon: const Icon(Icons.badge_outlined),
            ),
          ],
        );
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AddSiteFormSectionHeader(
              title: 'Phone Number',
              description: 'Add a reachable Nigerian phone number.',
            ),
            AddSiteLabeledTextField(
              controller: _phone,
              heading: 'Phone number',
              hintText: 'e.g 0803-456-7890',
              required: true,
              keyboardType: TextInputType.phone,
              prefixIcon: const Icon(Icons.call_outlined),
            ),
          ],
        );
      default:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AddSiteFormSectionHeader(
              title: 'Address & Profile Picture',
              description:
                  'Add your Nigerian location. Profile picture is optional.',
            ),
            Center(
              child: _ProfileImagePicker(
                image: _profileImage,
                initials: _initials(_name.text),
                onPick: _pickProfileImage,
              ),
            ),
            const SizedBox(height: 18),
            if (_loadingLocations)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_locationsError != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _locationsError!,
                      style: const TextStyle(color: AppColors.danger),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: _loadLocations,
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text('Retry'),
                    ),
                  ],
                ),
              )
            else ...[
              AddSiteLabeledDropdownField(
                heading: 'State',
                hintText: 'Select state',
                items: _states.map((item) => item.name).toList(),
                value: _selectedState,
                required: true,
                onChanged: _onStateChanged,
              ),
              AddSiteLabeledDropdownField(
                heading: 'LGA',
                hintText: _availableLgas.isEmpty
                    ? 'Select state first'
                    : 'Select LGA',
                items: _availableLgas,
                value: _selectedLga,
                required: true,
                onChanged: (value) => _lga.text = value ?? '',
              ),
            ],
            AddSiteLabeledTextField(
              controller: _address,
              heading: 'Address',
              hintText: 'Street, area, or nearest landmark',
              required: true,
              maxLines: 3,
              prefixIcon: const Icon(Icons.location_on_outlined),
            ),
            TextButton.icon(
              onPressed: () => setState(() => _profileImage = null),
              icon: const Icon(Icons.skip_next_rounded),
              label: const Text('Skip profile picture'),
            ),
          ],
        );
    }
  }

  void _continue() {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _movingForward = true;
      _step += 1;
    });
  }

  void _back() {
    setState(() {
      _movingForward = false;
      _step -= 1;
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await ref
        .read(authControllerProvider.notifier)
        .completeVolunteerProfile(
          name: _name.text.trim(),
          phone: _phone.text.trim(),
          stateName: _state.text.trim(),
          lga: _lga.text.trim(),
          address: _address.text.trim(),
          profileImagePath: _profileImage?.path,
        );
  }

  Future<void> _pickProfileImage() async {
    final image = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 82,
      maxWidth: 900,
    );
    if (image == null) return;
    setState(() => _profileImage = image);
  }

  Future<void> _loadLocations() async {
    setState(() {
      _loadingLocations = true;
      _locationsError = null;
    });
    try {
      final states = await _locationsService.fetchStatesAndLgas();
      if (!mounted) return;
      setState(() {
        _states = states;
        _loadingLocations = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loadingLocations = false;
        _locationsError =
            'Could not load Nigerian states and LGAs. Check internet and try again.';
      });
    }
  }

  void _onStateChanged(String? value) {
    setState(() {
      _state.text = value ?? '';
      _lga.clear();
    });
  }

  List<String> get _availableLgas {
    final selectedState = _selectedState;
    if (selectedState == null) return const [];
    final matches = _states.where((item) => item.name == selectedState);
    return matches.isEmpty ? const [] : matches.first.lgas;
  }

  String? get _selectedState {
    final value = _state.text.trim();
    return value.isEmpty ? null : value;
  }

  String? get _selectedLga {
    final value = _lga.text.trim();
    return value.isEmpty ? null : value;
  }

  String _initials(String value) {
    final parts = value.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) return '${parts.first[0]}${parts.last[0]}';
    if (value.trim().isEmpty) return 'V';
    return value.trim().characters.take(2).toString();
  }
}

class _ProfileImagePicker extends StatelessWidget {
  const _ProfileImagePicker({
    required this.image,
    required this.initials,
    required this.onPick,
  });

  final XFile? image;
  final String initials;
  final VoidCallback onPick;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      customBorder: const CircleBorder(),
      onTap: onPick,
      child: SizedBox(
        width: 118,
        height: 118,
        child: Stack(
          children: [
            Positioned.fill(
              child: ClipOval(
                child: DecoratedBox(
                  decoration: const BoxDecoration(
                    color: AppColors.onboardingCardGreen,
                    shape: BoxShape.circle,
                  ),
                  child: image == null
                      ? Center(
                          child: Text(
                            initials.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 34,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        )
                      : FutureBuilder<Uint8List>(
                          future: image!.readAsBytes(),
                          builder: (context, snapshot) {
                            if (snapshot.hasData) {
                              return Image.memory(
                                snapshot.data!,
                                fit: BoxFit.cover,
                              );
                            }
                            return const Center(
                              child: CircularProgressIndicator(
                                color: Colors.white,
                              ),
                            );
                          },
                        ),
                ),
              ),
            ),
            Positioned(
              right: 3,
              bottom: 5,
              child: Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: AppColors.deepGreen,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3),
                ),
                child: const Icon(
                  Icons.edit_rounded,
                  color: Colors.white,
                  size: 17,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
