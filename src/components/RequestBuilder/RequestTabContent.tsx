// components/RequestBuilder/RequestTabContent.tsx
'use client'
import AuthTab from "./AuthTab";
import BodyTab from "./BodyTab";
import HeadersTab from "./HeadersTab";
import ParamsTab from "./ParamsTab";
import PreRequestTab from "./PreRequestTab";
import TestTab from "./TestTab";
import { Auth, Header, Param, TabType } from "@/types/Collections";
import { Environment } from "@/types/User";

export default function RequestTabContent({
    activeRequestTab,
    handleAddParam,
    handleRemoveParam,
    handleUpdateParam,
    params,
    handleAddHeader,
    handleRemoveHeader,
    handleUpdateHeader,
    headers,
    body,
    setBody,
    auth,
    setAuth,
    preRequestScript,
    setPreRequestScript,
    setTests,
    tests,
    activeEnvironmentId,
    environments = [],
}: {
    activeRequestTab: TabType,
    handleAddParam: () => void,
    handleRemoveParam: (index: number) => void,
    handleUpdateParam: (index: number, field: keyof Param, value: string | boolean) => void,
    params: Param[],
    handleAddHeader: () => void,
    handleRemoveHeader: (index: number) => void,
    handleUpdateHeader: (index: number, field: keyof Header, value: string | boolean) => void,
    headers: Header[],
    body: string,
    setBody: React.Dispatch<React.SetStateAction<string>>,
    auth: Auth,
    setAuth: React.Dispatch<React.SetStateAction<Auth>>,
    preRequestScript: string,
    setPreRequestScript: React.Dispatch<React.SetStateAction<string>>,
    setTests: React.Dispatch<React.SetStateAction<string>>,
    tests: string,
    activeEnvironmentId: string | null,
    environments?: Environment[],
}) {
    return (
        <div className="p-4">
            {activeRequestTab === 'Params' && (
                <ParamsTab
                    handleAddParam={handleAddParam}
                    handleRemoveParam={handleRemoveParam}
                    handleUpdateParam={handleUpdateParam}
                    params={params}
                    activeEnvironmentId={''}
                    environments={[]}
                />
            )}

            {activeRequestTab === 'Headers' && (
                <HeadersTab
                    handleAddHeader={handleAddHeader}
                    handleRemoveHeader={handleRemoveHeader}
                    handleUpdateHeader={handleUpdateHeader}
                    headers={headers}
                    activeEnvironmentId={''}
                    environments={[]}
                />
            )}

            {activeRequestTab === 'Body' && (
                <BodyTab
                    body={body}
                    setBody={setBody}
                    environments={environments}
                    activeEnvironmentId={activeEnvironmentId}
                />
            )}

            {activeRequestTab === 'Auth' && (
                <AuthTab
                    auth={auth}
                    setAuth={setAuth}
                />
            )}

            {activeRequestTab === 'Pre-request' && (
                <PreRequestTab
                    preRequestScript={preRequestScript}
                    setPreRequestScript={setPreRequestScript}
                />
            )}

            {activeRequestTab === 'Tests' && (
                <TestTab
                    setTests={setTests}
                    tests={tests}
                />
            )}
        </div>
    );
}