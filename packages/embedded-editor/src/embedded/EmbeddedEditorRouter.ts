/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
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

import { Router, Routes } from "@kogito-tooling/core-api";

/**
 * Default router to be used for construction of an `EnvelopeBusOuterMessageHandler` by `EmbeddedEditor`.
 * Consumers can map the different supported editor URL routes as appropriate, if necessary.
 */
export class EmbeddedEditorRouter extends Router {
  constructor(...routesArray: Routes[]) {
    super(...routesArray);
  }

  public getRelativePathTo(uri: string): string {
    return `../${uri}`;
  }

  public getLanguageData(fileExtension: string) {
    return this.getLanguageDataByFileExtension().get(fileExtension);
  }

  public getTargetOrigin() {
    return "";
  }
}
