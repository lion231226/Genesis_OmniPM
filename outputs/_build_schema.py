
import json, os

OUT = r'D:\MyProject\Genesis_OmniPM\outputs'

schema = {
  '': 'https://json-schema.org/draft/2020-12/schema',
  '': 'https://omnipm.dev/schemas/expert_output_schema.json',
  'title': 'OmniPM Expert Output Schema v2.1.0',
  'description': 'Unified JSON Schema for 13 OmniPM experts - review findings with per-expert discriminated union extensions.',
  'type': 'object',
  'version': '2.1.0'
}

with open(os.path.join(OUT, 'expert_output_schema.json'), 'w', encoding='utf-8') as f:
    json.dump(schema, f, ensure_ascii=False, indent=2)
print('placeholder')
