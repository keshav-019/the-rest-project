/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Search, Archive, Play, Square, ChevronLeft, ChevronRight, Database, Copy, Code, FileText, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CollectionViewerProps {
    collectionName: string;
    connection: string;
    database: string;
}

export const CollectionViewer = ({ collectionName, connection, database }: CollectionViewerProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [mongoQuery, setMongoQuery] = useState(`db.${collectionName}.find().limit(100)`);
    const [isExecuting, setIsExecuting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalDocuments] = useState(150);
    const [limit] = useState(100);
    const [viewMode, setViewMode] = useState<'plain' | 'json'>('plain');

    const totalPages = Math.ceil(totalDocuments / limit);

    const jsonData = `[
        {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Introduction to MongoDB",
            "content": "MongoDB is a document database with the scalability and flexibility...",
            "author": "John Doe",
            "tags": ["database", "mongodb", "tutorial"],
            "createdAt": "2024-01-15T10:30:00Z",
            "views": 1250,
            "metadata": {
            "featured": true,
            "category": "tutorial",
            "difficulty": "beginner"
            }
        },
        {
            "_id": "507f1f77bcf86cd799439012",
            "title": "Advanced Query Techniques",
            "content": "Learn how to write complex queries using aggregation pipeline...",
            "author": "Jane Smith",
            "tags": ["advanced", "queries", "aggregation"],
            "createdAt": "2024-02-20T09:15:00Z",
            "views": 890,
            "metadata": {
            "featured": false,
            "category": "advanced",
            "difficulty": "expert"
            }
        },
        {
            "_id": "507f1f77bcf86cd799439013",
            "title": "Database Design Patterns",
            "content": "Best practices for designing MongoDB schemas and collections...",
            "author": "Bob Wilson",
            "tags": ["design", "patterns", "schema"],
            "createdAt": "2024-03-10T14:22:00Z",
            "views": 756,
            "metadata": {
            "featured": true,
            "category": "design",
            "difficulty": "intermediate"
            }
        }
    ]`;

    const handleExecuteQuery = () => {
        setIsExecuting(true);
        setTimeout(() => {
            setIsExecuting(false);
        }, 2000);
    };

    const handleStopQuery = () => {
        setIsExecuting(false);
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            const skip = (page - 1) * limit;
            setMongoQuery(`db.${collectionName}.find().skip(${skip}).limit(${limit})`);
        }
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(jsonData);
            console.log('Data copied to clipboard');
        } catch (err) {
            console.error('Failed to copy data:', err);
        }
    };

    const renderCollapsibleJson = () => {
        try {
            const data = JSON.parse(jsonData);
            return (
                <div className="space-y-2">
                    {data.map((item: any, index: number) => (
                        <CollapsibleDocument key={index} data={item} index={index} />
                    ))}
                </div>
            );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error: any) {
            return <div className="text-red-500">Invalid JSON format</div>;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="p-4 border-b bg-card shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Archive className="h-5 w-5 text-green-500" />
                        <h2 className="text-lg font-semibold">{collectionName}</h2>
                        <span className="text-sm text-muted-foreground">
                            {connection} → {database}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search documents..."
                                className="pl-10 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm">Export</Button>
                        <Button variant="outline" size="sm">Add Document</Button>
                    </div>
                </div>
            </div>

            <div className="p-4 border-b bg-muted/20 shrink-0">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">MongoDB Query</span>
                    </div>
                    <Textarea
                        value={mongoQuery}
                        onChange={(e) => setMongoQuery(e.target.value)}
                        className="font-mono text-sm min-h-[80px] resize-none"
                        placeholder="Enter your MongoDB query..."
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleExecuteQuery}
                                disabled={isExecuting}
                            >
                                <Play className="h-4 w-4 mr-1" />
                                Execute
                            </Button>
                            {isExecuting && (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleStopQuery}
                                >
                                    <Square className="h-4 w-4 mr-1" />
                                    Stop
                                </Button>
                            )}
                            {isExecuting && (
                                <span className="text-sm text-muted-foreground">Executing query...</span>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                {currentPage}/{totalPages} pages
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-3 border-b bg-muted/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'plain' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('plain')}
                    >
                        <FileText className="h-4 w-4 mr-1" />
                        Plain
                    </Button>
                    <Button
                        variant={viewMode === 'json' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('json')}
                    >
                        <Code className="h-4 w-4 mr-1" />
                        JSON
                    </Button>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                </Button>
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <ScrollArea className="flex-1">
                    <div className="p-4">
                        {viewMode === 'plain' ? (
                            <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                                {jsonData}
                            </pre>
                        ) : (
                            renderCollapsibleJson()
                        )}
                    </div>
                </ScrollArea>

                <div className="p-3 border-t bg-card text-sm text-muted-foreground shrink-0">
                    Showing 3 documents • Total: {totalDocuments} documents • Last updated: Just now
                </div>
            </div>
        </div>
    );
};

const CollapsibleDocument = ({ data, index }: { data: any; index: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    const renderValue = (value: any, key: string, depth: number = 0) => {
        if (value === null) return <span className="text-gray-500">null</span>;
        if (typeof value === 'boolean') return <span className="text-blue-600">{value.toString()}</span>;
        if (typeof value === 'number') return <span className="text-green-600">{value}</span>;
        if (typeof value === 'string') return <span className="text-red-600">&rdquo;{value}&rdquo;</span>;

        if (Array.isArray(value)) {
            return (
                <CollapsibleArray array={value} depth={depth} />
            );
        }

        if (typeof value === 'object') {
            return (
                <CollapsibleObject obj={value} depth={depth} />
            );
        }

        return <span>{String(value)}</span>;
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="border rounded-lg bg-card">
                <CollapsibleTrigger className="flex items-center gap-2 p-3 w-full text-left hover:bg-accent/50">
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                    )}
                    <span className="font-medium">Document {index + 1}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                        {Object.keys(data).length} fields
                    </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-3 pb-3 border-t">
                        <div className="font-mono text-sm pt-2">
                            {Object.entries(data).map(([key, value]) => (
                                <div key={key} className="ml-4 my-1">
                                    <span className="text-blue-800">&rdquo;{key}&rdquo;</span>
                                    <span className="text-gray-600">: </span>
                                    {renderValue(value, key, 1)}
                                    <span className="text-gray-600">,</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
};

const CollapsibleObject = ({ obj, depth }: { obj: any; depth: number }) => {
    const [isOpen, setIsOpen] = useState(depth < 2);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="inline-block">
                <CollapsibleTrigger className="inline-flex items-center gap-1 hover:bg-accent/50 rounded px-1">
                    {isOpen ? (
                        <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronRightIcon className="h-3 w-3" />
                    )}
                    <span className="text-gray-600">{"{"}</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="ml-4 border-l border-gray-300 pl-2">
                        {Object.entries(obj).map(([key, value]) => (
                            <div key={key} className="my-1">
                                <span className="text-blue-800">&rdquo;{key}&rdquo;</span>
                                <span className="text-gray-600">: </span>
                                {typeof value === 'object' && value !== null ? (
                                    Array.isArray(value) ? (
                                        <CollapsibleArray array={value} depth={depth + 1} />
                                    ) : (
                                        <CollapsibleObject obj={value} depth={depth + 1} />
                                    )
                                ) : (
                                    <>
                                        {typeof value === 'string' ? (
                                            <span className="text-red-600">&rdquo;{value}&rdquo;</span>
                                        ) : typeof value === 'number' ? (
                                            <span className="text-green-600">{value}</span>
                                        ) : typeof value === 'boolean' ? (
                                            <span className="text-blue-600">{value.toString()}</span>
                                        ) : (
                                            <span className="text-gray-500">null</span>
                                        )}
                                    </>
                                )}
                                <span className="text-gray-600">,</span>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
                <span className="text-gray-600">{"}"}</span>
            </div>
        </Collapsible>
    );
};

const CollapsibleArray = ({ array, depth }: { array: any[]; depth: number }) => {
    const [isOpen, setIsOpen] = useState(depth < 2);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="inline-block">
                <CollapsibleTrigger className="inline-flex items-center gap-1 hover:bg-accent/50 rounded px-1">
                    {isOpen ? (
                        <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronRightIcon className="h-3 w-3" />
                    )}
                    <span className="text-gray-600">{"["}</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="ml-4 border-l border-gray-300 pl-2">
                        {array.map((item, index) => (
                            <div key={index} className="my-1">
                                {typeof item === 'object' && item !== null ? (
                                    Array.isArray(item) ? (
                                        <CollapsibleArray array={item} depth={depth + 1} />
                                    ) : (
                                        <CollapsibleObject obj={item} depth={depth + 1} />
                                    )
                                ) : (
                                    <>
                                        {typeof item === 'string' ? (
                                            <span className="text-red-600">&rdquo;{item}&rdquo;</span>
                                        ) : typeof item === 'number' ? (
                                            <span className="text-green-600">{item}</span>
                                        ) : typeof item === 'boolean' ? (
                                            <span className="text-blue-600">{item.toString()}</span>
                                        ) : (
                                            <span className="text-gray-500">null</span>
                                        )}
                                    </>
                                )}
                                {index < array.length - 1 && <span className="text-gray-600">,</span>}
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
                <span className="text-gray-600">{"]"}</span>
            </div>
        </Collapsible>
    );
};