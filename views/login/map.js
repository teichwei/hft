function(doc) {
    if(doc.fid && doc.cid == 'A1'){
        log('login --- '+ doc.cid)
        emit(doc.fid, doc);
    }
}