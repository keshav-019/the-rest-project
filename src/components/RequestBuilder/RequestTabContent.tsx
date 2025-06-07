import AuthTab from "./AuthTab";
import BodyTab from "./BodyTab";
import HeadersTab from "./HeadersTab";
import ParamsTab from "./ParamsTab";
import PreRequestTab from "./PreRequestTab";
import TestTab from "./TestTab";
import { Auth, Header, Param, TabType } from "@/types/Collections";

/* eslint-disable @typescript-eslint/no-unused-vars */

export default function RequestTabContent({
    activeRequestTab,
    setActiveRequestTab,
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
    tests
}: {
    activeRequestTab: TabType,
    setActiveRequestTab: React.Dispatch<React.SetStateAction<TabType>>,
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
    tests: string
}) {
    return (
        <div className="p-4">
            {activeRequestTab === 'Params' && (
                <ParamsTab
                    handleAddParam={handleAddParam}
                    handleRemoveParam={handleRemoveParam}
                    handleUpdateParam={handleUpdateParam}
                    params={params}
                />
            )}

            {activeRequestTab === 'Headers' && (
                <HeadersTab
                    handleAddHeader={handleAddHeader}
                    handleRemoveHeader={handleRemoveHeader}
                    handleUpdateHeader={handleUpdateHeader}
                    headers={headers}
                />
            )}

            {activeRequestTab === 'Body' && (
                <BodyTab
                    body={body}
                    setBody={setBody}
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


