package controllers;

import play.*;
import play.libs.IO;
import play.mvc.*;

import java.io.File;
import java.util.*;
import models.*;
import play.vfs.VirtualFile;

public class AceEditor extends Controller {

    public static void index() {
        String projectName = Play.configuration.getProperty("application.name", "Unknown");
        VirtualFile vf = Play.roots.get(0);
        List files = getFiles(vf, new ArrayList());
        vf = vf.child("/app/controllers/Application.java");
        String src = "";
        String currentFile = "NONE";
        if (vf.exists()) {
            src = vf.contentAsString();
            currentFile = vf.getRealFile().getAbsolutePath();
        }
        String type = "ace/mode/java";
        int line = 0;
        render(projectName, src, files, currentFile, type);
    }

    public static void file(String path, int line) {
        String projectName = Play.configuration.getProperty("application.name", "Unknown");
        VirtualFile vf = Play.roots.get(0);
        List files = getFiles(vf, new ArrayList());
        File file = new File(path);
        String src = IO.readContentAsString(file).trim();
        String currentFile = file.getAbsolutePath();
        String type = type(file);
        renderTemplate("AceEditor/index.html", projectName, src, files, currentFile, type, line);
    }

    public static void save(String currentFile, String src) {
        if (currentFile.equals("NONE")) {
            renderText("");
        } else {
            //VirtualFile vf = Play.roots.get(0);
            //vf = vf.child("app/controllers/Application.java");
            File vf = new File(currentFile);
            IO.writeContent(src, vf);
            renderText(IO.readContentAsString(vf).trim());
        }
    }

    private static List getFiles(VirtualFile file, List files) {
        VirtualFile vf = Play.roots.get(0);
        for (VirtualFile f : file.list()) {
            if (f.isDirectory()) {
                getFiles(f, files);
            } else {
                String display = f.getRealFile().getAbsolutePath().replace(vf.getRealFile().getAbsolutePath(), "");
                if (isValid(display)) {
                    files.add(new SourceFile(f.getRealFile().getAbsolutePath(), f.getName(), display));
                }
            }
        }
        return files;
    }

    private static boolean isValid(String path) {
        if (path.startsWith("/tmp")) {
            return false;
        } else if (path.startsWith("/public")) {
            if (path.startsWith("/public/javascripts")) {
                return true;
            }
            if (path.startsWith("/public/stylesheets")) {
                return true;
            }
            if (path.equals("/public")) {
                return true;
            }
            return false;
        } else if (path.startsWith("/lib")) {
            return false;
        } else if (path.contains("DS_Store")) {
            return false;
        } else {
            return true;
        }
    }

    private static String type(File f) {
        if (f.getAbsolutePath().endsWith("application.conf")) {
            return "ace/mode/java";
        }
        if (f.getAbsolutePath().contains("/conf/messages")) {
            return "ace/mode/java";
        }
        if (f.getAbsolutePath().endsWith(".java")) {
            return "ace/mode/java";
        }
        if (f.getAbsolutePath().endsWith(".js")) {
            return "ace/mode/javascript";
        }
        if (f.getAbsolutePath().endsWith(".html")) {
            return "ace/mode/html";
        }
        if (f.getAbsolutePath().endsWith(".yml")) {
            return "ace/mode/yaml";
        }
        if (f.getAbsolutePath().endsWith(".sh")) {
            return "ace/mode/sh";
        }
        if (f.getAbsolutePath().endsWith(".xml")) {
            return "ace/mode/xml";
        }
        if (f.getAbsolutePath().endsWith(".sql")) {
            return "ace/mode/sql";
        }
        if (f.getAbsolutePath().endsWith(".scala")) {
            return "ace/mode/scala";
        }
        if (f.getAbsolutePath().endsWith(".less")) {
            return "ace/mode/less";
        }
        if (f.getAbsolutePath().endsWith(".cs")) {
            return "ace/mode/coffee";
        }
        if (f.getAbsolutePath().endsWith(".css")) {
            return "ace/mode/css";
        }
        return "ace/mode/text";
    }

    public static class SourceFile {
        public String path;
        public String name;
        public String displayPath;
        public SourceFile(String path, String name, String displayPath) {
            this.path = path;
            this.name = name;
            this.displayPath = displayPath;
        }
    }
}
