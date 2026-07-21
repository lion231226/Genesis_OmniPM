
import os, json

BASE = r"D:\MyProject\Genesis_OmniPM\templates"
os.makedirs(BASE, exist_ok=True)

def q(s):
    return json.dumps(s, ensure_ascii=False)

def node(nid, name, ntype, domain, deps, experts, criteria, tin, tout):
    L = []
    L.append("    - node_id: " + q(nid))
    L.append("      name: " + q(name))
    L.append("      node_type: " + q(ntype))
    L.append("      domain: " + q(domain))
    L.append("      depends_on: [" + ", ".join(q(d) for d in deps) + "]")
    L.append("      expert_panel:")
    for e in experts:
        L.append("        - expert: " + q(e["expert"]))
        L.append("          intensity: " + q(e["intensity"]))
        L.append("          focus: " + q(e["focus"]))
        L.append("          output_requirement: " + q(e["output_requirement"]))
    L.append("      success_criteria:")
    for c in criteria:
        L.append("        - " + q(c))
    L.append("      estimated_tokens:")
    L.append("        input: " + str(tin))
    L.append("        output: " + str(tout))
    L.append("      max_retries: 3")
    return chr(10).join(L)

def edge(eid, frm, to, cond, flow, label):
    return chr(10).join([
        "    - edge_id: " + q(eid),
        "      from: " + q(frm),
        "      to: " + q(to),
        "      condition: " + q(cond),
        "      data_flow: " + q(flow),
        "      label: " + q(label)])

def gate(gid, after, gtype, desc):
    return chr(10).join([
        "    - gate_id: " + q(gid),
        "      after_node: " + q(after),
        "      type: " + q(gtype),
        "      description: " + q(desc)])

def dim(name, depth, reason):
    return chr(10).join([
        "    - dimension: " + q(name),
        "      depth: " + q(depth),
        "      reason: " + q(reason)])

def esum(eid, intensity, reason):
    return chr(10).join([
        "    - expert: " + q(eid),
        "      intensity: " + q(intensity),
        "      reason: " + q(reason)])

def gen_template(t):
    L = []
    L.append("# " + "=" * 77)
    L.append("# OmniPM v2.1.0 — " + t.get("comment", t.get("name", "")))
    L.append("# " + "=" * 77)
    L.append("template:")
    L.append("  id: " + q(t["id"]))
    L.append("  name: " + q(t["name"]))
    L.append("  schema_version: " + q("2.1.0"))
    L.append("  project_type: " + q(t["project_type"]))
    L.append("  risk_level: " + json.dumps(t["risk_level"]))
    L.append("  complexity: " + json.dumps(t["complexity"]))
    L.append("  estimated_nodes: " + json.dumps(t["estimated_nodes"]))
    L.append("  description: >")
    for dline in t["description"].split(chr(10)):
        L.append("    " + dline.strip())
    L.append("")
    L.append("  design_dimensions:")
    for d in t["design_dimensions"]:
        L.append(dim(d["dimension"], d["depth"], d["reason"]))
    L.append("")
    L.append("  nodes:")
    for n in t["nodes"]:
        L.append(node(n["node_id"], n["name"], n["node_type"], n["domain"],
                      n.get("depends_on", []), n.get("expert_panel", []),
                      n.get("success_criteria", []),
                      n["estimated_tokens"]["input"], n["estimated_tokens"]["output"]))
        L.append("")
    L.append("  edges:")
    for e in t["edges"]:
        L.append(edge(e["edge_id"], e["from"], e["to"], e["condition"], e["data_flow"], e["label"]))
        L.append("")
    L.append("  gates:")
    for g in t["gates"]:
        L.append(gate(g["gate_id"], g["after_node"], g["type"], g.get("description", "")))
        L.append("")
    if "expert_panel_summary" in t:
        L.append("  expert_panel_summary:")
        for es in t["expert_panel_summary"]:
            L.append(esum(es["expert"], es["intensity"], es["reason"]))
    return chr(10).join(L)

# ================================================================
# Load template data and generate YAML files
# ================================================================
import sys
data = json.load(open(sys.argv[1], "r", encoding="utf-8"))
templates = data["templates"] if "templates" in data else [data]
for t in templates:
    yaml_content = gen_template(t)
    filepath = os.path.join(BASE, t["id"] + ".yaml")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(yaml_content)
    print("Written: " + t["id"] + ".yaml (" + str(len(yaml_content)) + " bytes)")
