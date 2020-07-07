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

import { GwtAppFormerApi } from "./GwtAppFormerApi";
import * as Core from "@kogito-tooling/core-api";
import { Rect } from "@kogito-tooling/core-api";
import * as MicroEditorEnvelope from "@kogito-tooling/microeditor-envelope";
import { GwtEditorWrapper } from "./GwtEditorWrapper";
import { GwtLanguageData, Resource } from "./GwtLanguageData";
import { XmlFormatter } from "./XmlFormatter";
import { GwtStateControlApi, GwtStateControlService } from "./gwtStateControl";
import { DefaultXmlFormatter } from "./DefaultXmlFormatter";
import { KogitoChannelApi, MessageBusClient } from "@kogito-tooling/microeditor-envelope-protocol";

declare global {
  interface Window {
    gwt: {
      stateControl: GwtStateControlApi;
    };
    JsInterop__Envelope__GuidedTour__GuidedTourCustomSelectorPositionProvider: GuidedTourCustomSelectorPositionProvider;
  }
}

function getPositionProvider() {
  return window.JsInterop__Envelope__GuidedTour__GuidedTourCustomSelectorPositionProvider.getInstance();
}

export const getGuidedTourElementPosition = (selector: string) => {
  return getPositionProvider().getPosition(selector);
};

interface GuidedTourCustomSelectorPositionProvider {
  getPosition(querySelector: string): Rect;

  getInstance(): GuidedTourCustomSelectorPositionProvider;
}

export class GwtGuidedTourService {
  public getElementPosition(selector: string) {
    return getPositionProvider().getPosition(selector);
  }
}

export class GwtEditorWrapperFactory implements MicroEditorEnvelope.EditorFactory<GwtLanguageData> {
  constructor(
    private readonly xmlFormatter: XmlFormatter = new DefaultXmlFormatter(),
    private readonly gwtAppFormerApi = new GwtAppFormerApi(),
    private readonly gwtStateControlService = new GwtStateControlService(),
    private readonly gwtGuidedTourService = new GwtGuidedTourService()
  ) {}

  public createEditor(languageData: GwtLanguageData, kogitoChannelApiClient: MessageBusClient<KogitoChannelApi>) {
    this.gwtAppFormerApi.setClientSideOnly(true);

    //FIXME: tiago Uncomment lines below
    (window as any).envelope = (window as any).envelope || {};
    (window as any).envelope.stateControl = this.gwtStateControlService.exposeApi(kogitoChannelApiClient);
    // window.gwt = {
    //   stateControl: this.gwtStateControlService.exposeApi(kogitoChannelApiClient)
    // };

    const gwtFinishedLoading = new Promise<Core.Editor>(res => {
      this.gwtAppFormerApi.onFinishedLoading(() => {
        res(
          new GwtEditorWrapper(
            languageData.editorId,
            this.gwtAppFormerApi.getEditor(languageData.editorId),
            kogitoChannelApiClient,
            this.xmlFormatter,
            this.gwtStateControlService,
            this.gwtGuidedTourService
          )
        );
        return Promise.resolve();
      });
    });

    return Promise.all(languageData.resources.map(resource => this.loadResource(resource))).then(() => {
      return gwtFinishedLoading;
    });
  }

  private loadResource(resource: Resource) {
    switch (resource.type) {
      case "css":
        for (const sheet of resource.paths) {
          const link = document.createElement("link");
          link.href = sheet;
          link.rel = "text/css";
          document.head.appendChild(link);
        }
        return Promise.resolve();
      case "js":
        return this.recursivelyLoadScriptsStartingFrom(resource.paths, 0);
    }
  }

  private recursivelyLoadScriptsStartingFrom(urls: string[], i: number) {
    if (i >= urls.length) {
      return Promise.resolve();
    }

    return new Promise<void>(res => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = urls[i];
      script.addEventListener("load", () => this.recursivelyLoadScriptsStartingFrom(urls, i + 1).then(res), false);
      document.head.appendChild(script);
    });
  }
}
