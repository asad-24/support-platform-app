import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../../core/utils/responsive.dart';
import '../../sites/data/sites_repository.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  static const _defaultCenter = LatLng(9.0820, 8.6753);

  final _mapController = MapController();
  LatLng? _currentLocation;
  bool _locating = false;

  @override
  Widget build(BuildContext context) {
    final sites = ref.watch(sitesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mapped sites')),
      body: sites.when(
        data: (items) {
          final center = items.isEmpty
              ? (_currentLocation ?? _defaultCenter)
              : LatLng(items.first.latitude, items.first.longitude);

          return Stack(
            children: [
              FlutterMap(
                mapController: _mapController,
                options: MapOptions(initialCenter: center, initialZoom: 6),
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.schoolsupportatlas.app',
                  ),
                  MarkerLayer(
                    markers: [
                      ...items.map(
                        (site) => Marker(
                          point: LatLng(site.latitude, site.longitude),
                          width: 48,
                          height: 48,
                          child: Tooltip(
                            message:
                                '${site.name}\n${site.uniqueSiteId} • ${site.urgencyLevel.label} urgency',
                            child: IconButton.filled(
                              tooltip: site.name,
                              onPressed: () => context.go('/sites/${site.id}'),
                              icon: const Icon(Icons.location_on_rounded),
                              style: IconButton.styleFrom(
                                backgroundColor: Colors.green.shade700,
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                      if (_currentLocation != null)
                        Marker(
                          point: _currentLocation!,
                          width: 54,
                          height: 54,
                          child: const Icon(
                            Icons.my_location_rounded,
                            color: Colors.blue,
                            size: 42,
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
              Align(
                alignment: Alignment.topCenter,
                child: Padding(
                  padding: Responsive.pagePadding(context),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.layers_rounded),
                          const SizedBox(width: 8),
                          Text(
                            items.isEmpty
                                ? 'No mapped sites yet'
                                : '${items.length} sites mapped',
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              Positioned(
                right: 16,
                bottom: 24,
                child: FloatingActionButton(
                  heroTag: 'map-current-location',
                  tooltip: 'Current location',
                  onPressed: _locating ? null : _showCurrentLocation,
                  child: _locating
                      ? const SizedBox.square(
                          dimension: 22,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.my_location_rounded),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
      ),
    );
  }

  Future<void> _showCurrentLocation() async {
    setState(() => _locating = true);
    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Location permission is required to show you on map.'),
          ),
        );
        return;
      }

      final position = await Geolocator.getCurrentPosition();
      final point = LatLng(position.latitude, position.longitude);
      if (!mounted) return;
      setState(() => _currentLocation = point);
      _mapController.move(point, 15);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }
}
