export default class Track {
    public block: Block;
    public cache: any[];
    public departed: boolean;
    public handle: string;
    public options: Option[];

    constructor (handle: string, options: Option[], block: Block) {
        this.handle = handle;
        this.block = block;
        this.departed = false;
        this.options = options;
    }
}
