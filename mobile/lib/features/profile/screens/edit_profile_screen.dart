import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/error/result.dart';
import '../../../core/utils/phone_validator.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/app_header.dart';
import '../../../shared/widgets/primary_button.dart';
import '../models/update_profile_request.dart';
import '../providers/profile_providers.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  bool _loading = false;
  bool _initialized = false;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _loading = true);
    final result = await ref.read(updateProfileProvider)(
      UpdateProfileRequest(
        name: _name.text.trim(),
        phone: _phone.text.replaceAll(RegExp(r'\D'), ''),
      ),
    );
    if (!mounted) return;
    setState(() => _loading = false);
    switch (result) {
      case Success():
        ref.invalidate(userProfileProvider);
        context.pop();
      case Error(:final failure):
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(failure.toString())),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(userProfileProvider);

    return Scaffold(
      appBar: const AppHeader(showBack: true, title: 'Edit Profile'),
      body: profile.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (user) {
          if (!_initialized) {
            _name.text = user.name;
            _phone.text = user.phone ?? '';
            _initialized = true;
          }
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                AppTextField(controller: _name, label: 'Name', hint: 'John Doe'),
                const SizedBox(height: 16),
                AppTextField(
                  controller: _phone,
                  label: 'Phone',
                  hint: '9876543210',
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  validator: (v) => validatePhone(v, required: false),
                ),
                const Spacer(),
                PrimaryButton(
                  label: 'Save',
                  isLoading: _loading,
                  onPressed: _save,
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
