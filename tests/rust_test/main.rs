fn main() {
    println!("Hello from rust!");
}

#[cfg(test)]
mod test {
    #[test]
    fn my_test() {
        let base: i32 = 2;
        assert_eq!(base.pow(2), 4, "rust doesn't work!!");
    }
}
