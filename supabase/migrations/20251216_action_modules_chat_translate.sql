-- =====================================================
-- FOX NETWORK: Add Chat and Auto Translate Modules
-- =====================================================

INSERT INTO action_module_definitions (key, name, description, icon, category, field_type, field_config, display_order) VALUES
  ('chat', 'Chat', 'Real-time chat with support or team members', 'MessageCircle', 'general', 'text', '{"enableRealtime": true, "allowAttachments": true}', 11),
  ('auto_translate', 'Auto Translate', 'Automatically translate content to the technician''s language', 'Languages', 'general', 'text', '{"supportedLanguages": ["en", "fr", "de", "es", "it", "pt", "nl"]}', 12)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  field_type = EXCLUDED.field_type,
  field_config = EXCLUDED.field_config,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
