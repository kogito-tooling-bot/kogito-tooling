/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Router } from "@kogito-tooling/core-api";
import * as React from "react";
import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "./GlobalContext";
import { EnvelopeBusOuterMessageHandler } from "@kogito-tooling/microeditor-envelope-protocol";
import { GitHubCodeMirrorEditor } from "../../GitHubCodeMirrorEditor";

export function KogitoEditorIframe(props: {
  openFileExtension: string;
  githubEditorCodeMirror: HTMLElement & GitHubCodeMirrorEditor;
  router: Router;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [globalState, setGlobalState] = useContext(GlobalContext);

  const envelopeBusOuterMessageHandler = new EnvelopeBusOuterMessageHandler(
    {
      postMessage: msg => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(msg, props.router.getTargetOrigin());
        }
      }
    },
    self => ({
      pollInit() {
        self.request_initResponse(window.location.origin);
      },
      receive_languageRequest() {
        self.respond_languageRequest(props.router.getLanguageData(props.openFileExtension));
      },
      receive_contentResponse(content: string) {
        // enableCommitButton();
        props.githubEditorCodeMirror.CodeMirror.setValue(content);
      },
      receive_contentRequest() {
        const githubEditorCodeMirrorContent = props.githubEditorCodeMirror.CodeMirror.getValue() || "";
        self.respond_contentRequest(githubEditorCodeMirrorContent);
      },
      receive_setContentError() {
        //FIXME: Display a nice message with explanation why "setContent" failed
        console.info("Set content error");
      },
      receive_dirtyIndicatorChange(isDirty: boolean) {
        //FIXME: Perhaps show window.alert to warn that the changes were not saved?
        console.info(`Dirty indicator changed to ${isDirty}`);
      },
      receive_ready() {
        console.info(`Editor is ready`);
        setGlobalState({ ...globalState, textModeEnabled: true });
      }
    })
  );

  useEffect(() => {
    const listener = (msg: MessageEvent) => envelopeBusOuterMessageHandler.receive(msg.data);
    window.addEventListener("message", listener, false);
    envelopeBusOuterMessageHandler.startInitPolling();

    return () => {
      envelopeBusOuterMessageHandler.stopInitPolling();
      window.removeEventListener("message", listener);
    };
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        id={"kogito-iframe"}
        className={globalState.fullscreen ? "fullscreen" : "not-fullscreen"}
        src={props.router.getRelativePathTo("envelope/index.html")}
      />
    </>
  );
}
