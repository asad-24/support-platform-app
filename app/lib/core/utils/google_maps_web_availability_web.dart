import 'dart:js_interop';
import 'dart:js_interop_unsafe';

import 'package:web/web.dart' as web;

bool isGoogleMapsWebAvailable() {
  final google = web.window.getProperty<JSObject?>('google'.toJS);
  return google != null && google.hasProperty('maps'.toJS).toDart;
}
