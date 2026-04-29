import 'google_maps_web_availability_stub.dart'
    if (dart.library.html) 'google_maps_web_availability_web.dart';

bool isGoogleMapsAvailableForCurrentPlatform() {
  return isGoogleMapsWebAvailable();
}
