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

import { GuidedTourServiceChannelApi } from "@kogito-tooling/guided-tour-service-api";
import { EditorContent, KogitoEdit, LanguageData, StateControlCommand } from "@kogito-tooling/core-api";
import { WorkspaceServiceChannelApi } from "@kogito-tooling/workspace-service-api";

interface StateControlChannelApi {
  receive_newEdit(edit: KogitoEdit): void;
  receive_stateControlCommandUpdate(command: StateControlCommand): void;
}

interface DefaultChannelApi {
  receive_setContentError(errorMessage: string): void;
  receive_ready(): void;
  receive_languageRequest(): Promise<LanguageData | undefined>;
  receive_contentRequest(): Promise<EditorContent>;
}

export interface KogitoChannelApi
  extends DefaultChannelApi,
    StateControlChannelApi,
    GuidedTourServiceChannelApi,
    WorkspaceServiceChannelApi {
  /**/
}
