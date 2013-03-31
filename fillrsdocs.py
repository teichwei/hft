from glob import glob
from base64 import b64encode
from md5 import md5
from datetime import datetime
import sys, os
import os.path
from mimemap import mime_map

fname = 'rs.json'

def existing_docs(fid):
    dir1 = '.data/'+fid+'/'
    lst = []
    if os.path.exists(dir1+fname):
        lst = eval(open(dir1+fname,'rb').read())
        if os.path.exists(dir1+fname+'.bak'):
            os.remove(dir1+fname+'.bak')
        os.rename(dir1+fname,dir1+fname+'.bak')
    return lst

def old_doc(lst, filename):
    for doc in lst:
        if doc['name'] == filename:
            return doc
    return {}

def main():
    if len(sys.argv) != 2:
        print "usage: python fillrsdocs.py <fid>"
        exit(0)
    fid = sys.argv[1].strip()
    old_docs = existing_docs(fid)
    
    dir1 = '.data/'+fid+'/'
    dir2 = dir1 + 'attachments/'
    ofile = open(dir1+fname, 'w')
    flst = glob(dir2 + '*.*')
    filestring = '# '+datetime.now().isoformat() +'\n[\n'
    ofile.write(filestring)
    
    eid_counts = {'p':0,'t':0,'a':0, 'v':0}
    for fpath in flst:
        filename = os.path.basename(fpath)
        letter1 = filename[0].lower()
        odoc = old_doc(old_docs, filename)  # see if doc existed

        if filename[-3:] == '.py':
            continue
        binary_data = open(fpath,'rb').read()
        msg = '  { "fid": "'+ fid +'",\n'
        msg +='   "cid": "RS",\n'
        eid_counts[letter1] += 1        
        _id = 'eid-rs' + filename[0] + str(eid_counts[letter1])
        msg +='   "_id": "' + _id + '",\n'
        msg +='   "tx": "0",\n'
        msg +='   "name": "' + filename +'",\n'
        #print filename
        msg +='   "mime": "' + mime_map[filename.split('.')[1].lower()] +'",\n'
        msg +='   "size": "' + str(os.path.getsize(fpath)) +'",\n'
        msg +='   "signature": "'+md5(b64encode(binary_data)).hexdigest()+'",\n'
        old_title = ''
        if odoc: old_title = odoc.pop('title','')
        old_anno = ''
        if odoc: old_anno = odoc.pop('anno','')
        if old_title:
            msg += '   "title": "' + old_title + '",\n'
        else:
            msg +='   "title": "' + _id + '",\n'
        if old_anno:
            msg +='   "anno": "' + old_anno + '"\n  },\n'
        else:
            msg +='   "anno": "' + _id + '"\n  },\n'
        ofile.write(msg)
    ofile.write(']')
    ofile.close()
    
if __name__ == "__main__":
    main()