import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/router/navigation_helper.dart';

/// EXAMPLE: Screen with Custom Back Button Handling
/// 
/// This is an example of how to handle back button presses in your screens,
/// especially useful for screens with unsaved data or important confirmations.
/// 
/// Copy this pattern to any screen where you need custom back behavior.

class ExampleScreenWithBackHandling extends StatefulWidget {
  const ExampleScreenWithBackHandling({super.key});

  @override
  State<ExampleScreenWithBackHandling> createState() =>
      _ExampleScreenWithBackHandlingState();
}

class _ExampleScreenWithBackHandlingState
    extends State<ExampleScreenWithBackHandling> {
  // Track if there's unsaved data
  bool _hasUnsavedData = false;
  final TextEditingController _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      setState(() {
        _hasUnsavedData = _controller.text.isNotEmpty;
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Handle back button - show confirmation if unsaved data exists
  Future<bool> _handleBackButton() async {
    if (!_hasUnsavedData) {
      return false; // Allow navigation
    }

    // Show confirmation dialog
    final shouldDiscard = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Discard changes?'),
        content: const Text(
          'You have unsaved changes. Are you sure you want to leave?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Keep Editing'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Discard'),
          ),
        ],
      ),
    );

    return !(shouldDiscard ?? false); // Prevent pop if not discarding
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_hasUnsavedData,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;

        // Handle back button press
        _handleBackButton().then((shouldPrevent) {
          if (!shouldPrevent && mounted) {
            NavigationHelper.pop(context);
          }
        });
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Example Screen'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              _handleBackButton().then((shouldPrevent) {
                if (!shouldPrevent && mounted) {
                  NavigationHelper.pop(context);
                }
              });
            },
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Unsaved Data Handling',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 16),
              const Text(
                'Try typing in the field below, then press the back button. '
                'A confirmation dialog will appear.',
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _controller,
                decoration: InputDecoration(
                  hintText: 'Type something...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  label: const Text('Example Input'),
                ),
                maxLines: 5,
              ),
              const SizedBox(height: 16),
              if (_hasUnsavedData)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.warning, color: Colors.orange),
                      const SizedBox(width: 8),
                      const Text('You have unsaved changes'),
                    ],
                  ),
                ),
              const SizedBox(height: 32),
              // Example: Different navigation methods
              _buildNavigationExample(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavigationExample(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Navigation Examples',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              // Push to stack (can go back)
              NavigationHelper.push(context, '/volunteer/home');
            },
            child: const Text('Push Route (with back)'),
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              // Replace route (no back)
              NavigationHelper.go(context, '/volunteer/home');
            },
            child: const Text('Go Route (no back)'),
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () {
              // Can only pop if not unsaved
              if (!_hasUnsavedData) {
                NavigationHelper.pop(context);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Save your changes first!'),
                  ),
                );
              }
            },
            child: const Text('Pop Route (back)'),
          ),
        ),
      ],
    );
  }
}

/// PATTERN 1: Simple Screen Without Back Handling
/// Use this for most screens
class SimpleScreen extends StatelessWidget {
  const SimpleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Simple Screen')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => NavigationHelper.pop(context),
          child: const Text('Go Back'),
        ),
      ),
    );
  }
}

/// PATTERN 2: Screen with Form & Unsaved Data
/// Use this when you have forms or user input
class FormScreen extends StatefulWidget {
  const FormScreen({super.key});

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isModified = false;

  Future<bool> _canNavigateBack() async {
    if (!_isModified) return false;

    return await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Discard changes?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Keep'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Discard'),
          ),
        ],
      ),
    ).then((value) => !(value ?? false));
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_isModified,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _canNavigateBack().then((prevent) {
          if (!prevent && mounted) NavigationHelper.pop(context);
        });
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('Form Screen')),
        body: Form(
          key: _formKey,
          onChanged: () => setState(() => _isModified = true),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => NavigationHelper.pop(context),
                    child: const Text('Save & Exit'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// PATTERN 3: Screen with Loading State
/// Use this when you have async operations
class LoadingScreen extends StatefulWidget {
  const LoadingScreen({super.key});

  @override
  State<LoadingScreen> createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> {
  bool _isLoading = false;

  Future<bool> _canNavigateBack() async {
    if (!_isLoading) return false;

    return await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Operation in progress'),
        content: const Text('An operation is in progress. Cancel it?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Wait'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Cancel'),
          ),
        ],
      ),
    ).then((value) => !(value ?? false));
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_isLoading,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _canNavigateBack().then((prevent) {
          if (!prevent && mounted) NavigationHelper.pop(context);
        });
      },
      child: Scaffold(
        appBar: AppBar(title: const Text('Loading Example')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isLoading) const CircularProgressIndicator(),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _isLoading
                    ? null
                    : () async {
                        setState(() => _isLoading = true);
                        await Future.delayed(const Duration(seconds: 2));
                        if (mounted) {
                          setState(() => _isLoading = false);
                        }
                      },
                child: const Text('Start Loading'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
