# file name: formatdata.py
# last modified: 2013-03-24 Jianchi Wei
# ----------------------
# generated a file '.data/<fid>/docs.buf, that can be read: open('','rb').read()
# (binary because of unicode). Sources:
# - '.data/<fid>/docs.json' - replace <count> with 6 random chars, and 13 digits
#   time-stamp(milisecs since epoch). If it is entity inst, a _<vid> appended.
#   objects of RL class will be treated at the end, to ensure the leid/reid be
#   updated to the newly generated _ids of all entity insts.
#   a formatdata.log will be generated to record to map of old _ids and the new.
# - '.data/<fid>/rs.json'
#   when appending docs from rs.json to docs.buf, docs will be updated for
#   1. file-size of the media file, and 
#   2. the digital-signature of the file(md5).
#   if the doc already has value(s) for 'size' / 'signature', they will be
#   over-written. _id will be generated the same way as above. Others unchanged.
# ------------------------
# next step: python pushdb.py <fid>
# this will read '.data/<fid>/docs.buf' and upload every doc to the given db.
# it will then attach data from all media files under .data/<fid>/attachments
# to the FA doc. the mime-type of each file comes from mimemap.py
# --------------
# notice: the 13 digits ts reflect the time point when formatdata.py is run.
# when seeing the records in DB, this ts is not the time of uploading.
# ------------------------------------------------------------------------------

from glob import glob
from datetime import datetime
import types, md5, random, time, os, os.path, codecs
from mimemap import mime_map

DATAROOTDIR = '.data/'

# get mime out of extension, size/signature of the file identfied by filepath.
def mime_size_sig(filepath):
    if not os.path.exists(filepath):
        print "file "+filepath+" doesn't exist."
        return 
    extension = filepath.split('.')[-1].lower()
    if extension not in mime_map.keys():
        print "extension: "+extension+" not supported."
        return
    data = open(filepath,'rb').read()
    sig = md5.md5(data).hexdigest()
    size = os.path.getsize(filepath)
    return mime_map[extension], size, sig

# generate 6 random chars + 13 miliseconds since epoch. It looks like:
# dErgoK1356430980320 - 19 chars long
def gen_idpart():
    charsource = 'abcdefghijklmnopqrsuvwxyzABCDEFGHIJKLMNOPQRSUVWXYZ'
    time.sleep(0.001)   # over 1 milis to ensure ts is diff from last one
    msg = ''
    for i in range(6):
        msg += random.choice(charsource)
    msg+= str(time.mktime(time.gmtime()))[:10]         # seconds since 1970
    msg+= str(datetime.now().microsecond)[:3].zfill(3) # mils within second.
    return msg # 6+13=19 chars long id

# update doc's _id, for RS doc also mime/size/signature. Not touch other attrs.
# fill in a mapping dictionary: old_id->new_id, to be used in update RL docs
def filldoc(doc, oldnewidsdict):
    _id = doc.get('_id','')
    if not _id:
        print ("doc has no _id:"+str(doc))
        return
    #print 'processing _id:', _id
    fid, cid, cnt = _id.split('-')

    # part behind <fid>-<cid>, namely from position 10, will be replaced. 
    new_id = fid+'-'+cid+'-'+gen_idpart()

    # entity class will have _<vid> appended: _1
    if cid not in ('RL','TX','SE'):
        new_id += '_1'

    # check if the old _id has an entry in oldnewidsdict, yes: warning/stop
    if oldnewidsdict.has_key(_id):
        print ("_id "+_id+" is not unique.")
        return

    # set new _id
    doc['_id'] = new_id

    # make entry of old-id -> new-id
    oldnewidsdict[_id] = new_id

    # for a RS doc, update mime,size and signature of doc
    if cid == 'RS':
        filepath = DATAROOTDIR +fid+'/attachments/'+doc['name']
        doc['mime'],doc['size'],doc['signature'] = mime_size_sig(filepath)
    
def resolve_refs(fid, docs, mapdict):
    count = 0
    for doc in docs:
        for k, v in doc.items():
            if type(v) == types.StringType:
                v = v.strip()
                if v.startswith(fid) and len(v) < 30:
                    if mapdict.has_key(v):
                        if k != '_id':
                            doc[k] = mapdict[v].split('_')[0]
                        else:
                            doc[k] = mapdict[v]
                        count += 1
                    else:
                        print ('key not in map: '+ v)
                        return
    if count > 0:
        resolve_refs(fid, docs, mapdict)

# output the old-id -> new-id map into a file (filename include fullpath)
def write_maplog(filename, mapdict):
    keys = mapdict.keys()
    keys.sort()
    ofile = open(filename,'w')
    ofile.write('# mapping old-id -> new-id@'+datetime.now().isoformat()+'\n\n')
    for key in keys:
        ofile.write(key+' -> '+mapdict[key]+'\n')
    ofile.close()

def valuestring(v):
    msg = ''
    if type(v) == types.StringType:
        return  '"' + v.decode('utf-8') +'"'
    if type(v) == types.IntType:
        return str(v)
    if type(v) == types.LongType:
        return str(v)
    if type(v) == types.UnicodeType:
        return 'u"' + v + '"'
    if type(v) == types.ListType:
        return str([ e for e in v ])
    if type(v) == types.DictType:
        return str({k: e for k, e in v.items() })
    if type(v) == types.NoneType:
        return ""
    
def format_fid(fid):
    dir1 = DATAROOTDIR +fid+'/'
    dir2 = dir1 + 'attachments/'
    if not os.path.exists(dir1+'docs.json'):
        return

    docs = []   # collecting entity-docs
    map_id = {}
    
    # in this docs.json file, a string '[...]' to be eval-ed into a doc-list
    dat1 = codecs.open(dir1+'docs.json','r','utf-8').read()
    if dat1[0] == u'\ufeff':    # eval would have issue with BOM head
        dat1 = dat1[1:]         # cut that, if BOM exists
    dat2 = codecs.open(dir1+'rs.json','r','utf-8').read()
    if dat2[0] == u'\ufeff':    # eval would have issue with BOM head
        dat2 = dat2[1:]         # cut that, if BOM exists
    
    doc_list = eval(dat1)
    rs_list = eval(dat2)
    #doc_list = eval(open(dir1+'docs.json','rb').read().decode('utf-8'))
    #rs_list = eval(open(dir1+'rs.json','rb').read())
    
    for doc in doc_list + rs_list:
        filldoc(doc, map_id)
        docs.append(doc)

    write_maplog(dir1+'docs.log', map_id)
    
    # now that old-new id map is complete for all entity-docs
    # do rl.leid/reid update, and put rl doc into docs list
    resolve_refs(fid, docs, map_id)
    
    # now put docs (list) into docs.buf, for pushdb.py to upload - the next step
    msg = '# Formatted ' + datetime.now().isoformat() + '\n\n[\n'
    sorted_docs = sorted(docs, key=lambda doc: doc['_id'])
    #for doc in docs:
    for doc in sorted_docs:
        print('id: '+doc['_id'])
        msg += ' {\n'
        msg += '  ' +'"_id": "' + doc.pop('_id') + '",\n'
        msg += '  ' +'"tx": "' + str(doc.pop('tx','0')) + '",\n'
        for k,v in doc.items():
            newv = valuestring(v)
            if type(newv) == types.NoneType:
                print 'valusestring returned None here'
            msg += '  "' + k + '": ' + newv + ',\n'
        msg += ' },\n'
    msg += ']\n'
    ff = codecs.open(dir1 + 'docs.buf','w','utf-8')
    ff.write(msg)
    ff.close()
    
    
def main():
    # under DATAROOTDIR(.data) are <fid> named directories. The ones with .bak are backups
    # that are to be excluded. fids collects all dir-names without .bak
    fids = [os.path.basename(fn) for fn in glob(DATAROOTDIR + "*") if not fn.endswith(".bak")]
    for fid in fids:
        format_fid(fid)

if __name__ == "__main__":
    main()