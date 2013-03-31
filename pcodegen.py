# ------------------------------------------------------------------------------
# pcodegen.py this is an offline program (not hosted on server)
# ------------
# run this to generate new promotional codes, appended into promocodes.py
# if promocodes.py does not exists, it will be generated.
# ------------------------------------------------------------------------------

import random, os
from datetime import datetime

import platform
    
promocodes_file = 'promocodes.py'

# -----------------------------------------------------------------------------
# 7 digits of 33 possible chars gives over 42 billion codes
# charset trys to not use 0,O,I - all that could be miss-readable
# -----------------------------------------------------------------------------
charset = ( '1','2','3','4','5','6','7','8','9','A',
            'B','C','D','E','F','G','H','J','K','L',
            'M','N','P','Q','R','S','T','U','V','W',
            'X','Y','Z',) # 33 chars

codes = {}

if os.path.exists(promocodes_file):
    import promocodes
    codes = promocodes.__dict__.get('codes',{})
    
count = len(codes)

def put_timestamp(file): # file must be a file opened for writing
    import os
    now = datetime.now()
    tstamp_string = now.strftime('%Y-%m-%d %H:%M:%S')
    file.write('#'*80+'\n')
    file.write('#\tGenerated:\t '+ tstamp_string+'\n')
    file.write('#\tFrom Computer: ' + os.environ['COMPUTERNAME'] + '\n')
    file.write('#\tFrom User: ' + os.environ['USERNAME'] + '\n')
    file.write('#'*80+'\n')

def gen(n):
    global count
    while n:
        code = ''
        code += random.choice(charset) # [0] char
        code += random.choice(charset) # [1] char
        code += random.choice(charset) # [2] char
        code += random.choice(charset) # [3] char
        code += random.choice(charset) # [4] char
        code += random.choice(charset) # [5] char
        code += random.choice(charset) # [6] char
        if code not in codes.values():
            codes[count] = code
            count += 1
            n -= 1
        if n == 0: 
            break

if __name__ == '__main__':
    old_count = count
    gen(20)
    if count != old_count:
        fout = open(promocodes_file,'w')
        put_timestamp(fout)
        fout.write('codes={\n')
        for k,v in codes.items():
            fout.write('\t'+str(k)+":'"+v+"',\n")
        fout.write('}\n')
        fout.close()
