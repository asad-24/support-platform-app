import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as osm;

import '../../../../core/theme/app_theme.dart';
import 'form_fields.dart';
import 'models.dart';
import 'shared_widgets.dart';

class LocationStep extends StatelessWidget {
  const LocationStep({
    super.key,
    required this.states,
    required this.availableLgas,
    required this.selectedState,
    required this.selectedLga,
    required this.isLoadingStates,
    required this.statesLoadError,
    required this.isFetchingLocation,
    required this.currentLocation,
    required this.onRetryLoadStates,
    required this.onStateChanged,
    required this.onLgaChanged,
    required this.onMapTap,
    required this.wardController,
    required this.communityController,
    required this.landmarkController,
    required this.latitudeController,
    required this.longitudeController,
    required this.onCaptureGps,
  });

  final List<NigeriaStateOption> states;
  final List<String> availableLgas;
  final String? selectedState;
  final String? selectedLga;
  final bool isLoadingStates;
  final String? statesLoadError;
  final bool isFetchingLocation;
  final osm.LatLng? currentLocation;
  final VoidCallback onRetryLoadStates;
  final ValueChanged<String?> onStateChanged;
  final ValueChanged<String?> onLgaChanged;
  final ValueChanged<osm.LatLng> onMapTap;
  final TextEditingController wardController;
  final TextEditingController communityController;
  final TextEditingController landmarkController;
  final TextEditingController latitudeController;
  final TextEditingController longitudeController;
  final VoidCallback onCaptureGps;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AddSiteFormSectionHeader(
          title: 'Location Details',
          description: 'Location of the school.',
        ),
        if (isLoadingStates)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (statesLoadError != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statesLoadError!,
                  style: const TextStyle(color: AppColors.danger),
                ),
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: onRetryLoadStates,
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
            items: states.map((item) => item.name).toList(),
            value: selectedState,
            required: true,
            onChanged: onStateChanged,
          ),
          AddSiteLabeledDropdownField(
            heading: 'LGA',
            hintText: availableLgas.isEmpty
                ? 'Select state first'
                : 'Select LGA',
            items: availableLgas,
            value: selectedLga,
            required: true,
            onChanged: onLgaChanged,
          ),
        ],
        Container(
          height: 250,
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border(context)),
          ),
          clipBehavior: Clip.antiAlias,
          child: currentLocation == null
              ? Center(
                  child: Text(
                    'Getting current location...',
                    style: TextStyle(color: AppColors.secondaryText(context)),
                  ),
                )
              : FlutterMap(
                  key: ValueKey(
                    '${currentLocation!.latitude},${currentLocation!.longitude}',
                  ),
                  options: MapOptions(
                    initialCenter: currentLocation!,
                    initialZoom: 16,
                    onTap: (_, point) => onMapTap(point),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.schoolsupportatlas.app',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: currentLocation!,
                          width: 54,
                          height: 54,
                          child: const Icon(
                            Icons.location_on_rounded,
                            color: AppColors.deepGreen,
                            size: 44,
                          ),
                        ),
                      ],
                    ),
                    RichAttributionWidget(
                      attributions: [
                        TextSourceAttribution(
                          'OpenStreetMap contributors',
                          onTap: () {},
                        ),
                      ],
                    ),
                  ],
                ),
        ),
        Row(
          children: [
            Expanded(
              child: Text(
                isFetchingLocation
                    ? 'Detecting current location...'
                    : 'Current location *',
                style: TextStyle(
                  color: AppColors.primaryText(context),
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            OutlinedButton.icon(
              onPressed: isFetchingLocation ? null : onCaptureGps,
              icon: isFetchingLocation
                  ? const SizedBox.square(
                      dimension: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location_rounded),
              label: const Text('Use current'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: AddSiteLabeledTextField(
                controller: latitudeController,
                heading: 'Latitude',
                hintText: 'Current latitude',
                required: true,
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: AddSiteLabeledTextField(
                controller: longitudeController,
                heading: 'Longitude',
                hintText: 'Current longitude',
                required: true,
                keyboardType: TextInputType.number,
              ),
            ),
          ],
        ),
        AddSiteLabeledTextField(
          controller: wardController,
          heading: 'Ward',
          hintText: 'Enter ward',
          required: true,
        ),
        AddSiteLabeledTextField(
          controller: communityController,
          heading: 'Community',
          hintText: 'Enter community',
          required: true,
        ),
        AddSiteLabeledTextField(
          controller: landmarkController,
          heading: 'Landmark',
          hintText: 'Nearby landmark',
        ),
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            'Tap the map or use your current location to autofill the school coordinates.',
            style: TextStyle(
              color: AppColors.secondaryText(context),
              fontSize: 12,
            ),
          ),
        ),
      ],
    );
  }
}
