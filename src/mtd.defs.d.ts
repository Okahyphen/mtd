interface GenericObject extends Object {
    [index: string]: any;
}

interface Settings extends Object {
    [index: string]: any;

    multi?: boolean;
    reportErros?: boolean;
    reruns?: boolean;
}

interface Option extends Object {
    [index: string]: any;

    $: string;
    _?: any;

    alias?: string;
    info?: string;
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
