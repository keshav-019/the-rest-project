import { ActiveResponseTab, Auth, Collection, Header, Param, Request, RequestType, ResponseData, TabType } from "@/types/Collections";
import CollectionsTree from "./CollectionsTree";
import RequestTabContent from "./RequestTabContent";
import RequestURLBar from "./RequestUrlBar";
import RequestsNavBar from "./RequestsNavbar";
import ResponseTab from "./ResponseTab";
import ReturnedResponseTab from "./ReturnedResponseTab";
import { Dispatch, SetStateAction } from "react";

export type MainContentProps = {
    collections: Collection[],
    handleAddRequest: (collectionId: string, folderId?: string) => void,
    handleAddFolder: (collectionId: string) => void,
    renameItem: (id: string, newName: string) => void, 
    deleteItem: (value: string) => void, 
    openRequestInTab: (request: Request) => void, 
    handleAddCollection: (name: string) => Promise<void>, 
    handleExportCollections: () => void, 
    handleImportCollections: () => void, 
    activeTabs: { id: string; request: Request; }[], 
    setActiveTabId: (value: React.SetStateAction<string | null>) => void, 
    closeTab: (value: string) => void, 
    activeTabId: string | null, 
    handleShareRequest: () => void, 
    handleSendRequest: () => void, 
    isLoading: boolean, 
    isStarred: boolean, 
    method: RequestType, 
    setIsStarred: React.Dispatch<React.SetStateAction<boolean>>, 
    setMethod: React.Dispatch<React.SetStateAction<RequestType>>, 
    setUrl: React.Dispatch<React.SetStateAction<string>>, 
    url: string, 
    activeRequestTab: TabType, 
    setActiveRequestTab: React.Dispatch<React.SetStateAction<TabType>>, 
    auth: Auth, 
    body: string, 
    handleAddHeader: () => void, 
    handleAddParam: () => void, 
    handleRemoveHeader: (index: number) => void, 
    handleRemoveParam: (index: number) => void, 
    handleUpdateHeader: (index: number, field: keyof Header, value: string | boolean) => void, 
    handleUpdateParam: (index: number, field: keyof Param, value: string | boolean) => void, 
    headers: Header[], 
    params: Param[], 
    preRequestScript: string, 
    setAuth: Dispatch<SetStateAction<Auth>>, 
    setBody: React.Dispatch<React.SetStateAction<string>>, 
    setPreRequestScript: React.Dispatch<React.SetStateAction<string>>, 
    setTests: React.Dispatch<React.SetStateAction<string>>, 
    tests: string, 
    activeResponseTab: ActiveResponseTab, 
    cookies: { name: string; value: string; domain: string; path: string; }[], 
    copyToClipboard: (text: string) => void, 
    error: string | null, 
    handleCopyResponse: () => void, 
    handleDownloadResponse: () => void, 
    response: ResponseData | null, 
    responseHeaders: { key: string; value: string; }[], 
    timeline: { name: string; duration: number; }[], 
    setActiveResponseTab: React.Dispatch<React.SetStateAction<ActiveResponseTab>>
}


export default function MainContent({ collections, handleAddRequest, handleAddFolder, renameItem, deleteItem, openRequestInTab, handleAddCollection, handleExportCollections, handleImportCollections, activeTabs, setActiveTabId, closeTab, activeTabId, handleShareRequest, handleSendRequest, isLoading, isStarred, method, setIsStarred, setMethod, setUrl, url, activeRequestTab, setActiveRequestTab, auth, body, handleAddHeader, handleAddParam, handleRemoveHeader, handleRemoveParam, handleUpdateHeader, handleUpdateParam, headers, params, preRequestScript, setAuth, setBody, setPreRequestScript, setTests, tests, activeResponseTab, cookies, copyToClipboard, error, handleCopyResponse, handleDownloadResponse, response, responseHeaders, timeline, setActiveResponseTab }: MainContentProps) {
    return (
        <div className="flex flex-1 overflow-hidden">
            {/* Collections Tree Sidebar */}
            {collections !== undefined && <CollectionsTree
                collections={collections} // Make sure this is your state variable
                onAddRequest={handleAddRequest}
                onAddFolder={handleAddFolder}
                onRenameItem={renameItem}
                onDeleteItem={deleteItem}
                onDuplicateRequest={(request) => {
                    const [collectionId, folderId] = request.id.split('-');
                    handleAddRequest(collectionId, folderId === 'root' ? undefined : folderId);
                }}
                onSelectRequest={openRequestInTab}
                onAddCollection={handleAddCollection}
                onExportCollections={handleExportCollections}
                onImportCollections={handleImportCollections}
            />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs Bar */}
                <div className="flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    {activeTabs.map(tab => (
                        <div
                            key={tab.id}
                            className={`flex items-center px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer ${activeTabId === tab.id ? 'bg-blue-50 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            onClick={() => setActiveTabId(tab.id)}
                        >
                            <span className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {tab.request.name}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(tab.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Request Builder Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    {activeTabId ? (
                        <>
                            <RequestURLBar
                                handleShareRequest={handleShareRequest}
                                handleSendRequest={handleSendRequest}
                                isLoading={isLoading}
                                isStarred={isStarred ?? false}
                                method={method}
                                setIsStarred={setIsStarred}
                                setMethod={setMethod}
                                setUrl={setUrl}
                                url={url}
                            />

                            <div className="flex flex-col md:flex-row h-[calc(100%-4rem)]">
                                {/* Request Configuration */}
                                <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                                    <div className="bg-white dark:bg-gray-800">
                                        <RequestsNavBar
                                            activeRequestTab={activeRequestTab}
                                            setActiveRequestTab={setActiveRequestTab}
                                        />

                                        <RequestTabContent
                                            activeRequestTab={activeRequestTab}
                                            auth={auth}
                                            body={body}
                                            handleAddHeader={handleAddHeader}
                                            handleAddParam={handleAddParam}
                                            handleRemoveHeader={handleRemoveHeader}
                                            handleRemoveParam={handleRemoveParam}
                                            handleUpdateHeader={handleUpdateHeader}
                                            handleUpdateParam={handleUpdateParam}
                                            headers={headers}
                                            params={params}
                                            preRequestScript={preRequestScript}
                                            setActiveRequestTab={setActiveRequestTab}
                                            setAuth={setAuth}
                                            setBody={setBody}
                                            setPreRequestScript={setPreRequestScript}
                                            setTests={setTests}
                                            tests={tests}
                                        />
                                    </div>
                                </div>

                                {/* Response Viewer */}
                                <div className="w-full md:w-1/2 overflow-y-auto">
                                    <div className="bg-white dark:bg-gray-800 h-full">
                                        <ResponseTab
                                            activeResponseTab={activeResponseTab}
                                            setActiveResponseTab={setActiveResponseTab}
                                        />

                                        <ReturnedResponseTab
                                            activeResponseTab={activeResponseTab}
                                            cookies={cookies}
                                            copyToClipboard={copyToClipboard}
                                            error={error}
                                            handleCopyResponse={handleCopyResponse}
                                            handleDownloadResponse={handleDownloadResponse}
                                            isLoading={isLoading}
                                            response={response}
                                            responseHeaders={responseHeaders}
                                            timeline={timeline}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-6 max-w-md">
                                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No Request Selected</h3>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Select a request from the sidebar or create a new one to get started.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}


