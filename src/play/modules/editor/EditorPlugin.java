package play.modules.editor;

import play.Logger;
import play.Play;
import play.mvc.Http.Request;
import play.mvc.Http.Response;
import play.PlayPlugin;

import java.lang.Integer;
import java.net.URLDecoder;

public class EditorPlugin extends PlayPlugin {

    public void onLoad() {
        Logger.info("The web editor plugin is enabled. Go to http://localhost:9000/@editor to use it ...");
    }

    public boolean rawInvocation(Request request, Response response) throws Exception {
        if (Play.mode == Play.Mode.DEV) {
            try {
                if (Logger.isDebugEnabled()) Logger.debug(request.url);
                Request.current.set(request);
                Response.current.set(response);
                if (request.url.startsWith("/@editor/file")) {
                    String path = URLDecoder.decode(request.querystring.split("path=")[1].split("&")[0]);
                    //String path = request.params.get("path");
                    //Integer line = request.params.get("line", Integer.class);
                    Integer line = Integer.valueOf(request.querystring.split("line=")[1]);
                    AceEditor.file(request, response, path, line);
                    return true;
                } else if (request.url.startsWith("/@editor/save")) {
                    String currentFile = request.params.get("currentFile");
                    String src = request.params.get("src");
                    AceEditor.save(request, response, currentFile, src);
                    return true;
                } else if (request.url.startsWith("/@editor/delete")) {
                    String currentFile = request.params.get("name");
                    AceEditor.deleteFile(request, response, currentFile);
                    return true;
                } else if (request.url.startsWith("/@editor/createdir")) {
                    String currentFile = request.params.get("name");
                    AceEditor.createDir(request, response, currentFile);
                    return true;
                } else if (request.url.startsWith("/@editor/create")) {
                    String currentFile = request.params.get("name");
                    AceEditor.createFile(request, response, currentFile);
                    return true;
                } else if (request.url.startsWith("/@editor")) {
                    AceEditor.index(request, response);
                    return true;
                }
            } catch (Throwable t) {
                Throwable th = t;
                t.printStackTrace();
                while(th.getCause() != null) {
                    th = t.getCause();
                    th.printStackTrace();
                }
            }
        }
        return false;
    }
}