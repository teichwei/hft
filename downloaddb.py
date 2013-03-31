import json
from datetime import datetime
import shutil, os, os.path
import couchdb

map_fun = 'function(doc){ emit(doc.id, doc.fid); }'
rootdir = '.data'

def managedir(fid):
    dir1 = rootdir + '/'+fid    # where fid data is located
    dir0 = dir1 + '.bak'        # old one renamed to this
    dir2 = dir1 + '/attachments'# under fid dir, attachments-location
    
    if os.path.exists(dir1):    # old one existed
        if os.path.exists(dir0):# delete old bak
            shutil.rmtree(dir0)
        os.rename(dir1, dir0)   # old fid copied to bak
    os.mkdir(dir1)            # create new fid(dir1)
    os.mkdir(dir2)            # create new attachments dir under dir1
    return dir1, dir2           # return the names
        
def docdict(doc):
    items = doc.items()
    dic = {}
    for item in items:
        dic[item[0]] = item[1]
    return dic

        
def savedb(db):
    fdict = {}
    fiddir = ''
    fidattdir = ''
    now_string = datetime.now().isoformat()
    
    for row in db.query(map_fun):
        fid = row.value
        if not fdict.has_key(fid):
            # directory: .data/<fid>/attachments. row.value == fid
            fdict = {}
            fiddir, fidattdir = managedir(fid)
            
        doc = db.get(row.id,'')
        if doc:
            dic = docdict(doc)
            fdict[row.id] = dic
            for key in dic.keys():
                if key == 'attachments':  # attachments in doc
                    for att in dic[key]:
                        # doc['attachments']=[{att1},{att2},..]
                        # att1: {'filename':,'sig':,'title':,'type':, anno: }
                        # -----------------------------------------------------
                        # read data from db attachment(a file object), writeout.
                        filename = att['filename']
                        fobj = db.get_attachment(doc, filename)
                        ofile = open(fidattdir + '/'+filename, 'wb')
                        ofile.write(fobj.read())
                        ofile.close()
    
        docs_string = '# FTC Generated: '+ now_string + '\n\n['
        for oid in fdict.keys():
            docs_string += json.dumps(fdict[oid])+",\n"
        ofile = open(fiddir + '/docs.py','w')
        ofile.write(docs_string+"]")
        ofile.close()

def main():
    dbname = 'hftdb'
    server = couchdb.Server('http://localhost:5984')
    db = server[dbname]

    savedb(db)

if __name__ == "__main__":
    main()
