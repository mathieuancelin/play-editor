Play !> web editor
=================

A Play 1 module to edit your application inside your application in DEV mode.

![Play web editor](https://github.com/mathieuancelin/play-editor/raw/master/webide.png "Play web editor")

To use it, clone the repo inside your play modules

```
$ cd ${PLAY_HOME}/modules
git clone https://github.com/mathieuancelin/play-editor.git editor
```

add the dependency in your project and sync the project dependencies :

```
- play -> editor 1.0
```

or add a 'editor' file inside the module folder of your app with :

```
/path/to/play-1.2.5/modules/editor
```

When starting the application, the web editor is available at http://localhost:9000/@editor

You can edit your code, create files or directories, insert snippets.

You can use shortcuts like Command-S to save the current file and Command-B to run the 'test URL' while coding the application. Each time the editor lose focus, the current file is saved.

ACE shortcuts can be found here : https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts