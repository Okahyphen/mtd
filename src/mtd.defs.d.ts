interface GenericObject extends Object {
    [index: string]: any;
}

interface Settings extends Object {
    [index: string]: any;

    multi?: boolean;
    reruns?: boolean;
    results?: boolean;
}

interface Option extends Object {
    [index: string]: any;

    $: string;
    _?: any;

    alias?: string;
    info?: string;
    optional?: boolean;
    pass?: boolean;
    type?: string;
}

interface Parsed {
    [index: string]: Object | string[];

    alias: Object;
    default: Object;
    boolean: string[];
    string: string[];
}

interface Block {
    (...args: any[]): any;
}
