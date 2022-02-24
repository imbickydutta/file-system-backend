# file-system-backend

Backend API for a file system like google drive / drop-box.

## Documentation for API

### Sign Up

- Method : POST
- URL : https://drive-system.herokuapp.com/user/signup/
- req body example : {"user_name": "Bicky", "email" : "abc@gmail.com", "password": "secret123"}
- In response you will get a bearer token that you have to use in all requests

### Login

- Method : POST
- URL : https://drive-system.herokuapp.com/user/login/
- req body example : {"email" : "abc@gmail.com", "password": "secret123"}
- In response you will get a bearer token that you have to use in all requests

### Get Root

- Method : GET
- URL : https://drive-system.herokuapp.com/user/root/
- Use token as Bearer token

### Post/Create Folder

- Method : POST
- URL : https://drive-system.herokuapp.com/drive?path=< enter path here >/
- Query path example : root/folder1/childfolder1/grandchild1/
- Use token as Bearer token

### Post/Upload File

- Method : POST
- URL : https://drive-system.herokuapp.com/drive/uploadFile?path=< enter path here >/
- Query path example : root/folder1/childfolder1/grandchild1/
- Query path is the path where File will be uploaded
- Req body : {"file_url": file.txt}
- Use token as Bearer token

### Get Folder Details

- Method : GET
- URL : https://drive-system.herokuapp.com/drive?path=< enter path here >/
- Query path example : root/folder1/childfolder1/grandchild1/
- Use token as Bearer token

### Delete Folder

- Method : DELETE
- URL : https://drive-system.herokuapp.com/drive/?path=< enter path here >/
- Query path example : root/folder1/childfolder1/grandchild1/
- Use token as Bearer token
- Folder only gets deleted when it is empty

### Delete File

- Method : DELETE
- URL : https://drive-system.herokuapp.com/drive/deleteFile?path=< enter path here >/
- Query path example : root/folder1/childfolder1/grandchild1/
- Use token as Bearer token

### Move Folder

- Method : PATCH
- URL : https://drive-system.herokuapp.com/drive/move?path=< enter path here >/
- Query path example : root/folder1/childfolder1/grandchild1/
- Query path is the path of the folder that we want to move
- Req Body example : {"newParentPath": "root/folder2/childfolder1/"}
- Req body path is the path of the folder where the original folder is moved
- Use token as Bearer token

### Move Folder

- Method : PATCH
- URL : https://drive-system.herokuapp.com/drive/moveFile?path=< enter path here >/
- Query path example : root/folder1/childfolder1/grandchild1/fileName.txt
- Query path is the path of the file that we want to move
- Req Body example : {"newParentPath": "root/folder2/childfolder1/"}
- Req body path is the path of the folder where the original folder is moved
- Use token as Bearer token

### Rename Folder

- Work under progress (needs some rework)
- Method : PATCH
- URL : https://drive-system.herokuapp.com/drive/rename?path=< enter path here >/
- Query path example : root/folder1/childfolder1/oldFolderName/
- Query path is the path of the folder that we want to rename
- Req Body example : {"newName": "newFolderName"}
- Req body newName is the new name of the folder
- Use token as Bearer token

### Rename File

- Work under progress (needs some rework)
- Method : PATCH
- URL : https://drive-system.herokuapp.com/drive/rename?path=< enter path here >/
- Query path example : root/folder1/childfolder1/oldFileName.txt
- Query path is the path of the folder that we want to rename
- Req Body example : {"newFileName": "newFileName.txt"}
- Req body newName is the new name of the folder
- Use token as Bearer token
