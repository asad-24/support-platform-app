import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../../core/utils/responsive.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../sites/data/sites_repository.dart';

class MapScreen extends ConsumerWidget {
  const MapScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sites = ref.watch(sitesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mapped sites')),
      body: sites.when(
        data: (items) {
          if (items.isEmpty) {
            return const EmptyState(
              icon: Icons.map_outlined,
              title: 'No mapped sites yet',
              message: 'Captured GPS points will appear here after sync.',
            );
          }
          final center = LatLng(items.first.latitude, items.first.longitude);
          final markers = items.map((site) {
            return Marker(
              markerId: MarkerId(site.id),
              position: LatLng(site.latitude, site.longitude),
              infoWindow: InfoWindow(
                title: site.name,
                snippet:
                    '${site.uniqueSiteId} • ${site.urgencyLevel.label} urgency',
                onTap: () => context.go('/sites/${site.id}'),
              ),
            );
          }).toSet();

          return Stack(
            children: [
              GoogleMap(
                initialCameraPosition: CameraPosition(target: center, zoom: 6),
                markers: markers,
                myLocationButtonEnabled: true,
                mapToolbarEnabled: false,
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
                          Text('${items.length} sites mapped'),
                        ],
                      ),
                    ),
                  ),
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
}
