
import json, os, sys
OUT = 'D:/MyProject/Genesis_OmniPM/outputs'

def t(code):
    if code=='s': return {'type':'string'}
    if code=='b': return {'type':'boolean'}
    if code=='n': return {'type':'number'}
    if code=='i': return {'type':'integer'}
    if code.startswith('s:'): return {'type':'string','enum':code[2:].split(',')}
    if code.startswith('a:'): return {'type':'array','items':t(code[2:])}
    if code.startswith('p:'): return {'type':'string','pattern':code[2:]}
    if code.startswith('o:'):
        rest=code[2:]
        if '|' in rest:
            reqs_str,props_str=rest.split('|',1)
            reqs=reqs_str.split(',') if reqs_str else []
            props={}
            for pair in props_str.split(','):
                if ':' in pair:
                    k,v=pair.split(':',1)
                    props[k]=t(v)
            return {'type':'object','required':reqs,'properties':props,'additionalProperties':False}
        return {'type':'object','properties':{},'additionalProperties':False}
    return {'type':'string'}

def ext(name,reqs,fields):
    fields['extensionType']={'const':name}
    return {'allOf':[{'':'#//baseExtension'},{'type':'object','required':reqs,'properties':fields,'additionalProperties':False}]}

def finish(E,elist,clist,C,D):
    FINDING=t('o:id,severity,category,normalizedTitle,title,detail,suggestion|id:p:^F-[a-f0-9]{8}$,severity:s:P0_BLOCKING,P1_IMPORTANT,P2_SUGGESTION,category:s:'+C+',normalizedTitle:s,title:s,detail:s,suggestion:s,condition:s,relatedDesignDimension:s:'+D+',prerequisiteFindings:a:s')
    EI=','.join(elist); CN=','.join(clist)
    schema={'':'https://json-schema.org/draft/2020-12/schema','':'https://omnipm.dev/schemas/expert_output_schema.json','title':'OmniPM Expert Output Schema','description':'Unified JSON Schema for all 13 OmniPM expert subagent outputs. Structured review findings with per-expert extensions via discriminated union oneOf + fallback unknownExpertExtension. findingId format: FINDING-{nodeId}-{expertId}-{uuid8}. Aggregation: worstCaseWins BLOCKED>REVISE>APPROVE_WITH_CONDITIONS>APPROVE. Semantic dedup via (category,normalizedTitle). v2.1.0.','version':'2.1.0','type':'object','required':['schemaVersion','findingId','meta','assessment','findings','expertExtension'],'properties':{'schemaVersion':{'type':'string','const':'2.1.0'},'findingId':t('p:^FINDING-[a-zA-Z0-9_-]+-[A-Z_]+-[a-f0-9]{8}$'),'meta':t('o:nodeId,expertId,canonicalName,intensity,timestamp|nodeId:s,expertId:s:'+EI+',canonicalName:s:'+CN+',intensity:s:LIGHT,STANDARD,DEEP,PAIR,pairPartner:s:'+EI+',timestamp:p:^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2},projectType:s:development,course,solution,graphic,av,strengthWeight:n'),'assessment':t('o:overallVerdict,severitySummary,thinkingProcess,parseQuality|overallVerdict:s:APPROVE,APPROVE_WITH_CONDITIONS,REVISE,BLOCKED,severitySummary:o:P0_BLOCKING,P1_IMPORTANT,P2_SUGGESTION|P0_BLOCKING:i,P1_IMPORTANT:i,P2_SUGGESTION:i,thinkingProcess:s,confidenceScore:n,crossDomainConcerns:a:o:domain,concern|domain:s,concern:s,targetExpert:s,parseQuality:o:status|status:s:SUCCESS,DEGRADED,FALLBACK,warnings:a:s,fieldsMissing:a:s,fallbackDetail:s'),'findings':t('a:'+json.dumps(FINDING)),'expertExtension':{'type':'object','description':'Expert-specific extension. Discriminated union via extensionType with 14 variants (13 known + 1 fallback).','oneOf':[{'':'#//requirementsExtension'},{'':'#//architectExtension'},{'':'#//databaseExtension'},{'':'#//securityExtension'},{'':'#//frontendExtension'},{'':'#//backendExtension'},{'':'#//qaExtension'},{'':'#//devopsExtension'},{'':'#//courseDesignerExtension'},{'':'#//contentReviewerExtension'},{'':'#//marketAnalystExtension'},{'':'#//seoExpertExtension'},{'':'#//mediaProducerExtension'},{'':'#//unknownExpertExtension'}],'discriminator':{'propertyName':'extensionType','mapping':{clist[i]:'#//'+['requirementsExtension','architectExtension','databaseExtension','securityExtension','frontendExtension','backendExtension','qaExtension','devopsExtension','courseDesignerExtension','contentReviewerExtension','marketAnalystExtension','seoExpertExtension','mediaProducerExtension'][i] for i in range(13)}}},'pairReport':t('o:partnerExpertId,consensusPoints,divergencePoints,jointRecommendations|partnerExpertId:s,consensusPoints:a:s,divergencePoints:a:o:topic,positionA,positionB,resolution|topic:s,positionA:s,positionB:s,resolution:s,jointRecommendations:a:s')},'additionalProperties':False,'':E}
    path=os.path.join(OUT,'expert_output_schema.json')
    with open(path,'w',encoding='utf-8') as f: json.dump(schema,f,ensure_ascii=False,indent=2)
    print(f'Schema written: {os.path.getsize(path)/1024:.1f} KB')

print('Engine loaded. Call finish(E,elist,clist,C,D) to generate schema.')
