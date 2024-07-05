import {LinkedList} from '../common/container/list/LinkedList';

/**
 * 链表测试
 */
export class LinkedListTest {
    /**
     * 测试链表
     */
    public static process(): void {
        let list = new LinkedList<number>();
        list.push(1);
        list.push(2);
        list.push(3);
        console.log('forPrev');
        list.forPrev(data => console.log(`${data} `));
        console.log('forNext');
        list.forNext(data => console.log(`${data} `));
        list.pop();
        console.log('forPrev');
        list.forPrev(data => console.log(`${data} `));
        console.log('forNext');
        list.forNext(data => console.log(`${data} `));
    }
}