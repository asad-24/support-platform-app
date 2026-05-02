import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../shared/widgets/app_logo.dart';
import '../../sites/presentation/add_site_flow/form_fields.dart';
import '../../sites/presentation/add_site_flow/models.dart';
import '../../sites/presentation/add_site_flow/nigeria_locations_service.dart';
import '../auth_validators.dart';
import '../data/auth_repository.dart';
import 'auth_controller.dart';

class VolunteerApplicationScreen extends ConsumerStatefulWidget {
  const VolunteerApplicationScreen({super.key});

  @override
  ConsumerState<VolunteerApplicationScreen> createState() =>
      _VolunteerApplicationScreenState();
}

class _VolunteerApplicationScreenState
    extends ConsumerState<VolunteerApplicationScreen> {
  static const _genders = ['Female', 'Male', 'Prefer not to say'];
  static const _educationLevels = [
    'No formal education',
    'Primary',
    'Secondary',
    'OND/NCE',
    'HND/BSc',
    'Postgraduate',
  ];
  static const _availabilityOptions = [
    'Weekdays',
    'Weekends',
    'Both weekdays and weekends',
    'Flexible',
  ];
  static const _volunteeringModes = [
    'Field visits',
    'Remote support',
    'Hybrid',
  ];

  final _formKey = GlobalKey<FormState>();
  final _locationsService = NigeriaLocationsService();
  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _dateOfBirth = TextEditingController();
  final _gender = TextEditingController();
  final _state = TextEditingController();
  final _lga = TextEditingController();
  final _address = TextEditingController();
  final _educationLevel = TextEditingController();
  final _occupation = TextEditingController();
  final _skills = TextEditingController();
  final _experience = TextEditingController();
  final _availability = TextEditingController();
  final _volunteeringMode = TextEditingController();
  final _motivation = TextEditingController();
  final _emergencyName = TextEditingController();
  final _emergencyPhone = TextEditingController();

  bool _consent = false;
  bool _submitting = false;
  bool _loadingLocations = true;
  String? _locationsError;
  List<NigeriaStateOption> _states = [];

  @override
  void initState() {
    super.initState();
    _loadLocations();
  }

  @override
  void dispose() {
    _fullName.dispose();
    _email.dispose();
    _phone.dispose();
    _dateOfBirth.dispose();
    _gender.dispose();
    _state.dispose();
    _lga.dispose();
    _address.dispose();
    _educationLevel.dispose();
    _occupation.dispose();
    _skills.dispose();
    _experience.dispose();
    _availability.dispose();
    _volunteeringMode.dispose();
    _motivation.dispose();
    _emergencyName.dispose();
    _emergencyPhone.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Volunteer Registration'),
        leading: IconButton(
          tooltip: 'Back',
          onPressed: () => context.go('/login/volunteer'),
          icon: const Icon(Icons.arrow_back_rounded),
        ),
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: Responsive.pageMaxWidth(context),
            ),
            child: Form(
              key: _formKey,
              child: ListView(
                padding: Responsive.pagePadding(context),
                children: [
                  const Center(child: AppLogo(size: 70)),
                  const SizedBox(height: 18),
                  Text(
                    'Register as a Volunteer',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'All fields marked * are required.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.secondaryText(context)),
                  ),
                  const SizedBox(height: 22),
                  _SectionCard(
                    title: 'Personal Details',
                    children: [
                      AddSiteLabeledTextField(
                        controller: _fullName,
                        heading: 'Full name',
                        hintText: 'Enter full name',
                        required: true,
                        prefixIcon: const Icon(Icons.badge_outlined),
                      ),
                      AddSiteLabeledTextField(
                        controller: _email,
                        heading: 'Email',
                        hintText: 'name@example.com',
                        required: true,
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: const Icon(Icons.mail_outline_rounded),
                        validator: AuthValidators.emailError,
                      ),
                      AddSiteLabeledTextField(
                        controller: _phone,
                        heading: 'Phone / WhatsApp',
                        hintText: 'e.g 0803-456-7890',
                        required: true,
                        keyboardType: TextInputType.phone,
                        prefixIcon: const Icon(Icons.call_outlined),
                        validator: AuthValidators.phoneError,
                      ),
                      AddSiteLabeledTextField(
                        controller: _dateOfBirth,
                        heading: 'Date of birth',
                        hintText: 'YYYY-MM-DD',
                        required: true,
                        keyboardType: TextInputType.datetime,
                        prefixIcon: const Icon(Icons.calendar_today_outlined),
                      ),
                      AddSiteLabeledDropdownField(
                        heading: 'Gender',
                        hintText: 'Select gender',
                        items: _genders,
                        value: _selectedValue(_gender),
                        required: true,
                        onChanged: (value) =>
                            setState(() => _gender.text = value ?? ''),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _SectionCard(
                    title: 'Address',
                    children: [
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
                          value: _selectedValue(_state),
                          required: true,
                          onChanged: _onStateChanged,
                        ),
                        AddSiteLabeledDropdownField(
                          heading: 'LGA',
                          hintText: _availableLgas.isEmpty
                              ? 'Select state first'
                              : 'Select LGA',
                          items: _availableLgas,
                          value: _selectedValue(_lga),
                          required: true,
                          onChanged: (value) =>
                              setState(() => _lga.text = value ?? ''),
                        ),
                      ],
                      AddSiteLabeledTextField(
                        controller: _address,
                        heading: 'Residential address',
                        hintText: 'Street, area, or nearest landmark',
                        required: true,
                        maxLines: 3,
                        prefixIcon: const Icon(Icons.location_on_outlined),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _SectionCard(
                    title: 'Experience',
                    children: [
                      AddSiteLabeledDropdownField(
                        heading: 'Education level',
                        hintText: 'Select education level',
                        items: _educationLevels,
                        value: _selectedValue(_educationLevel),
                        required: true,
                        onChanged: (value) =>
                            setState(() => _educationLevel.text = value ?? ''),
                      ),
                      AddSiteLabeledTextField(
                        controller: _occupation,
                        heading: 'Occupation',
                        hintText: 'Enter current occupation',
                        required: true,
                        prefixIcon: const Icon(Icons.work_outline_rounded),
                      ),
                      AddSiteLabeledTextField(
                        controller: _skills,
                        heading: 'Relevant skills',
                        hintText: 'Languages, data collection, outreach...',
                        required: true,
                        maxLines: 3,
                        prefixIcon: const Icon(Icons.handyman_outlined),
                      ),
                      AddSiteLabeledTextField(
                        controller: _experience,
                        heading: 'Previous volunteer experience',
                        hintText: 'Describe past volunteer work',
                        required: true,
                        maxLines: 3,
                        prefixIcon: const Icon(Icons.history_edu_outlined),
                      ),
                      AddSiteLabeledDropdownField(
                        heading: 'Availability',
                        hintText: 'Select availability',
                        items: _availabilityOptions,
                        value: _selectedValue(_availability),
                        required: true,
                        onChanged: (value) =>
                            setState(() => _availability.text = value ?? ''),
                      ),
                      AddSiteLabeledDropdownField(
                        heading: 'Preferred volunteering mode',
                        hintText: 'Select mode',
                        items: _volunteeringModes,
                        value: _selectedValue(_volunteeringMode),
                        required: true,
                        onChanged: (value) => setState(
                          () => _volunteeringMode.text = value ?? '',
                        ),
                      ),
                      AddSiteLabeledTextField(
                        controller: _motivation,
                        heading: 'Motivation',
                        hintText: 'Why do you want to volunteer?',
                        required: true,
                        maxLines: 3,
                        prefixIcon: const Icon(Icons.volunteer_activism),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  _SectionCard(
                    title: 'Emergency Contact',
                    children: [
                      AddSiteLabeledTextField(
                        controller: _emergencyName,
                        heading: 'Emergency contact name',
                        hintText: 'Enter contact name',
                        required: true,
                        prefixIcon: const Icon(Icons.contact_emergency),
                      ),
                      AddSiteLabeledTextField(
                        controller: _emergencyPhone,
                        heading: 'Emergency contact phone',
                        hintText: 'e.g 0803-456-7890',
                        required: true,
                        keyboardType: TextInputType.phone,
                        prefixIcon: const Icon(Icons.call_outlined),
                        validator: AuthValidators.phoneError,
                      ),
                      CheckboxListTile(
                        value: _consent,
                        onChanged: (value) =>
                            setState(() => _consent = value ?? false),
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                        title: const Text(
                          'I confirm that the information provided is accurate.',
                        ),
                        subtitle: !_consent
                            ? const Text(
                                'Required',
                                style: TextStyle(color: AppColors.danger),
                              )
                            : null,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  ElevatedButton.icon(
                    onPressed:
                        _submitting ||
                            _loadingLocations ||
                            _locationsError != null
                        ? null
                        : _submit,
                    icon: _submitting
                        ? const SizedBox.square(
                            dimension: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.send_rounded),
                    label: const Text('Submit Registration Request'),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: _submitting
                        ? null
                        : () => context.go('/login/volunteer'),
                    child: const Text('Back to sign in'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
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
        _locationsError = 'Could not load Nigerian states and LGAs.';
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
    final stateName = _state.text.trim();
    if (stateName.isEmpty) return const [];
    final matches = _states.where((item) => item.name == stateName);
    return matches.isEmpty ? const [] : matches.first.lgas;
  }

  String? _selectedValue(TextEditingController controller) {
    final value = controller.text.trim();
    return value.isEmpty ? null : value;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || !_consent) {
      setState(() {});
      return;
    }
    setState(() => _submitting = true);
    try {
      final result = await ref
          .read(authControllerProvider.notifier)
          .submitVolunteerApplication(
            VolunteerApplication(
              fullName: _fullName.text.trim(),
              email: _email.text.trim(),
              phone: _phone.text.trim(),
              dateOfBirth: _dateOfBirth.text.trim(),
              gender: _gender.text.trim(),
              state: _state.text.trim(),
              lga: _lga.text.trim(),
              address: _address.text.trim(),
              educationLevel: _educationLevel.text.trim(),
              occupation: _occupation.text.trim(),
              skills: _skills.text.trim(),
              volunteerExperience: _experience.text.trim(),
              availability: _availability.text.trim(),
              volunteeringMode: _volunteeringMode.text.trim(),
              motivation: _motivation.text.trim(),
              emergencyContactName: _emergencyName.text.trim(),
              emergencyContactPhone: _emergencyPhone.text.trim(),
            ),
          );
      if (!mounted) return;
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Request submitted'),
          content: Text(
            'Your registration request ${result.requestId} is pending admin review.',
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Sign in'),
            ),
          ],
        ),
      );
      if (mounted) context.go('/login/volunteer');
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              title,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 14),
            ...children,
          ],
        ),
      ),
    );
  }
}
